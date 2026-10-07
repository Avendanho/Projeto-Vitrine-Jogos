/* Página de região: a lista e a carta se destacam uma à outra.
 * Apontar (ou tocar) um lugar ou uma rota num dos dois acende o par no outro;
 * em telas estreitas, onde a carta só mostra números, o nome aparece ao tocar. */
const artigo = document.querySelector(".regiao");

function ligar(chave) {
  const todos = [...artigo.querySelectorAll(`[data-${chave}]`)];
  let preso = null;        // o que foi escolhido com um toque fica aceso até o próximo toque
  const acender = (valor) => {
    for (const el of todos) el.classList.toggle("ativo", valor !== null && el.dataset[chave] === valor);
  };
  for (const el of todos) {
    if (el instanceof SVGElement) continue;      // os traços das rotas só recebem o destaque
    el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") acender(el.dataset[chave]); });
    el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") acender(preso); });
    el.addEventListener("click", () => {
      preso = preso === el.dataset[chave] ? null : el.dataset[chave];
      acender(preso);
    });
  }
}

ligar("lugar");
ligar("rota");
