/* Linha do tempo: o ano em destaque acompanha a rolagem; o filtro esconde categorias. */
const anos = [...document.querySelectorAll(".linha-ano")];
const anoAtual = document.querySelector("[data-ano-atual]");
const consoleAtual = document.querySelector("[data-console-atual]");
const indice = [...document.querySelectorAll(".linha-indice a")];

function marcar(li) {
  anoAtual.textContent = li.dataset.ano;
  consoleAtual.textContent = li.dataset.console;
  for (const a of indice) a.classList.toggle("atual", a.dataset.ano === li.dataset.ano);
}

/* vale o último ano cujo topo já passou de um terço da tela */
let agendado = false;
function atualizar() {
  agendado = false;
  const limite = window.innerHeight * 0.36;
  let escolhido = anos[0];
  for (const li of anos) {
    if (li.getBoundingClientRect().top + parseFloat(getComputedStyle(li).paddingTop) - 30 <= limite) escolhido = li;
    else break;
  }
  marcar(escolhido);
}
window.addEventListener("scroll", () => {
  if (!agendado) { agendado = true; requestAnimationFrame(atualizar); }
}, { passive: true });
window.addEventListener("resize", atualizar);
atualizar();

const fichas = [...document.querySelectorAll(".filtro-linha .ficha")];
for (const ficha of fichas) {
  ficha.addEventListener("click", () => {
    const tipos = ficha.dataset.tipo ? ficha.dataset.tipo.split(" ") : null;
    for (const f of fichas) f.setAttribute("aria-pressed", String(f === ficha));
    for (const li of anos) {
      const jogos = [...li.querySelectorAll(".linha-jogos > li")];
      let visiveis = 0;
      for (const j of jogos) {
        j.hidden = Boolean(tipos) && !tipos.includes(j.dataset.tipo);
        if (!j.hidden) visiveis++;
      }
      li.classList.toggle("sem-jogos", jogos.length > 0 && visiveis === 0);
    }
    atualizar();
  });
}
