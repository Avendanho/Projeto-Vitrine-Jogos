/* Biblioteca: filtros combináveis, guardados no endereço da página. */
import { REDUZIDO } from "./ilha-viva.js";

const CHAVES = ["geracao", "regiao", "console", "estilo", "perfil"];
const itens = [...document.querySelectorAll(".arquipelago > li")];
const botoes = [...document.querySelectorAll("[data-filtro]")];
const contagem = document.querySelector("[data-contagem]");
const rotulo = document.querySelector("[data-contagem-rotulo]");
const limpar = document.querySelector("[data-limpar]");
const vazio = document.querySelector(".vazio");

const estado = Object.fromEntries(CHAVES.map((c) => [c, ""]));
const inicial = new URLSearchParams(location.search);
for (const c of CHAVES) {
  const v = inicial.get(c);
  if (v && botoes.some((b) => b.dataset.filtro === c && b.dataset.valor === v)) estado[c] = v;
}

function combina(li) {
  return CHAVES.every((c) => {
    if (!estado[c]) return true;
    return (li.dataset[c] || "").split(" ").includes(estado[c]);
  });
}

function aplicar() {
  let visiveis = 0;
  for (const li of itens) {
    const ok = combina(li);
    li.hidden = !ok;
    if (ok) visiveis++;
  }
  for (const b of botoes) b.setAttribute("aria-pressed", String(estado[b.dataset.filtro] === b.dataset.valor));
  const ativos = CHAVES.filter((c) => estado[c]);
  contagem.textContent = visiveis;
  rotulo.textContent = visiveis === 1 ? "ilha no mapa" : "ilhas no mapa";
  limpar.hidden = ativos.length === 0;
  vazio.hidden = visiveis > 0;

  const busca = new URLSearchParams();
  for (const c of ativos) busca.set(c, estado[c]);
  const texto = busca.toString();
  history.replaceState(null, "", texto ? `?${texto}` : location.pathname);
}

function mudar() {
  if (document.startViewTransition && !REDUZIDO) document.startViewTransition(aplicar);
  else aplicar();
}

for (const b of botoes) {
  b.addEventListener("click", () => {
    const c = b.dataset.filtro;
    estado[c] = estado[c] === b.dataset.valor ? "" : b.dataset.valor;
    mudar();
  });
}
limpar.addEventListener("click", () => {
  for (const c of CHAVES) estado[c] = "";
  mudar();
});

aplicar();
