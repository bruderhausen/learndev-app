/**
 * O service worker da versão de celular.
 *
 * É ele que faz o app abrir sem internet depois da primeira visita — que é o
 * ponto inteiro de instalar em vez de só abrir o site. Sem ele, "instalado" é
 * um atalho bonito para uma página que não carrega no ônibus.
 *
 * Estratégia, por tipo de arquivo:
 *
 *   navegação (a própria página)  rede primeiro, cache se falhar
 *   dados.json.gz                 cache primeiro, e atualiza por trás
 *   resto (JS, CSS, fontes, wasm) cache primeiro; o nome tem hash, então um
 *                                 arquivo em cache nunca está desatualizado
 *
 * A navegação é a única que vai à rede antes: é ela que traz o `index.html`
 * novo apontando para os JS de hash novo. Servir o index do cache primeiro
 * prenderia o app numa versão até o cache expirar.
 */

// A marca da linha abaixo e trocada pelo gerar-estatico.mjs a cada
// publicacao — e por isso ela nao pode aparecer escrita neste comentario, ou
// seria ela a trocada. Ela faz duas coisas ao mesmo tempo: da um cache novo para cada versao, e — mais
// importante — deixa este arquivo BYTE-DIFERENTE do publicado antes. O
// navegador so instala um service worker novo quando o sw.js muda; com um
// arquivo fixo, o worker antigo ficava para sempre, e o cache dele junto.
const VERSAO = '2026-09-11T16:49:29.646Z'
const CACHE = 'learndev-' + VERSAO

/** O mínimo para a primeira abertura offline funcionar. */
const ESSENCIAL = ['./', './index.html', './dados.json.gz', './manifest.webmanifest']

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      // `addAll` falha inteiro se um só der erro, e um 404 num arquivo
      // acessório não pode impedir a instalação.
      await Promise.all(
        ESSENCIAL.map((u) => cache.add(u).catch(() => {})),
      )
      await self.skipWaiting()
    }),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      for (const nome of await caches.keys()) {
        if (nome !== CACHE) await caches.delete(nome)
      }
      await self.clients.claim()
    })(),
  )
})

async function guardar(pedido, resposta) {
  // Resposta parcial ou de outra origem não serve para servir depois.
  if (!resposta || resposta.status !== 200 || resposta.type !== 'basic') return resposta
  const cache = await caches.open(CACHE)
  cache.put(pedido, resposta.clone())
  return resposta
}

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request
  if (pedido.method !== 'GET') return

  const url = new URL(pedido.url)
  if (url.origin !== self.location.origin) return

  // A página: rede primeiro, para pegar o index novo quando houver.
  if (pedido.mode === 'navigate') {
    evento.respondWith(
      // `cache: 'no-store'` porque entre a Pages e o aparelho existe um CDN, e
      // um index guardado la fora aponta para os JS da versao anterior.
      fetch(pedido, { cache: 'no-store' })
        .then((r) => guardar(pedido, r))
        .catch(async () => (await caches.match('./index.html')) ?? Response.error()),
    )
    return
  }

  // O pacote de conteúdo: responde do cache na hora e busca a versão nova por
  // trás. Assim a aula abre instantânea, e o conteúdo novo chega na próxima
  // abertura — sem nunca deixar a pessoa esperando a rede.
  if (url.pathname.endsWith('dados.json.gz')) {
    evento.respondWith(
      caches.match(pedido).then((emCache) => {
        const daRede = fetch(pedido)
          .then((r) => guardar(pedido, r))
          .catch(() => emCache ?? Response.error())
        return emCache ?? daRede
      }),
    )
    return
  }

  evento.respondWith(
    caches.match(pedido).then(
      (emCache) =>
        emCache ??
        fetch(pedido)
          .then((r) => guardar(pedido, r))
          .catch(() => Response.error()),
    ),
  )
})
