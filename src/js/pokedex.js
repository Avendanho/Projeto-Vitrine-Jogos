/* Pokédex na página de jogo: abas (quando o jogo tem mais de uma lista),
 * busca por nome ou número, filtro por tipo, e a cor que volta ao apontar. */
import { colorirAoApontar, semAcento } from "./gaveta.js";

const secao = document.querySelector("[data-pokedex]");
const gavetas = [...secao.querySelectorAll(".gaveta")];
const abas = [...secao.querySelectorAll("[data-aba]")];
const tipos = [...secao.querySelectorAll("[data-tipo]")];
const campo = secao.querySelector("#dex-procurar");
const contagem = secao.querySelector("[data-dex-contagem]");
const rotulo = secao.querySelector("[data-dex-rotulo]");
const vazio = secao.querySelector("[data-dex-vazio]");
const mais = secao.querySelector("[data-dex-mais]");

/* As palavras do contador vêm da página, que pode estar em português ou em inglês. */
const ROTULOS = { especie: "espécie", especies: "espécies", mostrar: "Mostrar as {n} espécies", ...JSON.parse(secao.dataset.rotulos || "{}") };

let atual = gavetas[0];
let tipo = "";

function aplicar() {
  const texto = semAcento(campo.value);
  const numero = /^\d+$/.test(texto) ? Number(texto) : null;
  // quem procura ou filtra quer ver todos os resultados, não só as primeiras fileiras
  if (texto || tipo) secao.classList.remove("recolhida");
  let visiveis = 0;
  for (const li of atual.children) {
    const porTexto = !texto || li.dataset.nome.includes(texto) ||
      (numero !== null && Number(li.querySelector(".dex-numero").textContent) === numero);
    const porTipo = !tipo || li.dataset.tipos.split(" ").includes(tipo);
    li.hidden = !(porTexto && porTipo);
    if (!li.hidden) visiveis++;
  }
  // só ficam habilitados os tipos que existem na lista aberta
  const presentes = new Set();
  for (const li of atual.children) for (const t of li.dataset.tipos.split(" ")) presentes.add(t);
  for (const b of tipos) {
    b.hidden = !presentes.has(b.dataset.tipo);
    b.setAttribute("aria-pressed", String(b.dataset.tipo === tipo));
  }
  contagem.textContent = visiveis;
  rotulo.textContent = visiveis === 1 ? ROTULOS.especie : ROTULOS.especies;
  vazio.hidden = visiveis > 0;
  mais.parentElement.hidden = !secao.classList.contains("recolhida");
  mais.textContent = ROTULOS.mostrar.replace("{n}", atual.children.length);
}

for (const aba of abas) {
  aba.addEventListener("click", () => {
    atual = gavetas.find((g) => g.dataset.lista === aba.dataset.aba);
    for (const g of gavetas) g.hidden = g !== atual;
    for (const a of abas) a.setAttribute("aria-pressed", String(a === aba));
    if (tipo && ![...atual.children].some((li) => li.dataset.tipos.split(" ").includes(tipo))) tipo = "";
    aplicar();
  });
}
for (const b of tipos) {
  b.addEventListener("click", () => {
    tipo = tipo === b.dataset.tipo ? "" : b.dataset.tipo;
    aplicar();
  });
}
campo.addEventListener("input", aplicar);

/* a lista começa recolhida; sem JavaScript ela aparece inteira */
secao.classList.add("recolhida");
mais.addEventListener("click", () => {
  secao.classList.remove("recolhida");
  aplicar();
});

colorirAoApontar(secao);
aplicar();
