import{codigoDoAparelho as u,verificar as v}from"./licenca-celular-2fz8hPGp.js";const d={negado:{titulo:"Este aparelho ainda não foi liberado",corpo:'Mande o número abaixo para quem te vendeu o LearnDev. Assim que ele liberar, toque em "Já paguei" — não precisa reinstalar nada.'},"sem-rede":{titulo:"Sem internet para conferir",corpo:"O LearnDev confere a liberação de vez em quando. Conecte à internet uma vez e ele volta a funcionar offline pelas próximas semanas."},"sem-suporte":{titulo:"Este navegador é antigo demais",corpo:"A verificação usa uma assinatura digital que o seu navegador ainda não sabe conferir. Atualize o Chrome (ou o Safari) e abra de novo."},liberado:{titulo:"",corpo:""}};function f(a,l){var c,s;const n=d[l],r=u();a.innerHTML=`
    <div class="pagina pagina-ativacao">
      <h1>${n.titulo}</h1>
      <p class="hero-sub">${n.corpo}</p>

      <div class="ativacao-codigo">
        <span class="ativacao-rotulo">o número deste aparelho</span>
        <code id="ativacao-numero">${r}</code>
        <button type="button" class="botao-fantasma" id="ativacao-copiar">copiar</button>
      </div>

      <button type="button" class="botao-principal" id="ativacao-conferir">Já paguei — conferir</button>
      <p class="ativacao-aviso" id="ativacao-aviso" hidden></p>
    </div>`;const t=a.querySelector("#ativacao-aviso");(c=a.querySelector("#ativacao-copiar"))==null||c.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(r),t.textContent="copiado",t.hidden=!1}catch{const o=a.querySelector("#ativacao-numero"),i=document.createRange();i.selectNodeContents(o);const e=window.getSelection();e==null||e.removeAllRanges(),e==null||e.addRange(i)}}),(s=a.querySelector("#ativacao-conferir"))==null||s.addEventListener("click",async()=>{const o=a.querySelector("#ativacao-conferir");o.disabled=!0,o.textContent="conferindo…",t.hidden=!0;const i=await v();if(i.estado==="liberado"){location.reload();return}o.disabled=!1,o.textContent="Conferir de novo",t.textContent=d[i.estado].titulo,t.hidden=!1})}export{f as montar};
