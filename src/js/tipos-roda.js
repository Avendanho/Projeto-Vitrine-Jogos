/* Roda de tipos: escolher um tipo acende quem ele atinge em dobro (linha cheia, saindo dele) e quem o atinge
 * em dobro (linha tracejada, chegando nele); ao lado, as seis listas completas. O tipo escolhido fica no
 * endereço, para mandar a alguém. As contas estão em tipos-logica.js. */
import { TIPOS, TABELA } from "./dados/tipos.js";
import { relacoes, lugarNaRoda, trecho } from "./tipos-logica.js";
import { semAcento, selo } from "./especies-logica.js";

const raiz = document.querySelector("[data-roda]");
const botoes = [...raiz.querySelectorAll(".roda-tipo")], linhas = raiz.querySelector("[data-linhas]");
const centro = raiz.querySelector("[data-centro]"), leitura = raiz.querySelector("[data-leitura]");
const lugar = new Map(botoes.map((b, i) => [b.dataset.nome, lugarNaRoda(i, botoes.length)]));
const SVG = "http://www.w3.org/2000/svg";
/* As seis listas, na ordem em que aparecem: chave em relacoes(), título e o que dizer quando está vazia. */
const GRUPOS = [
  ["atinge", "Atinge em dobro", "Nenhum tipo."], ["apanha", "Apanha em dobro de", "Nenhum tipo."],
  ["poucoEfeito", "Atinge pela metade", "Nenhum tipo."], ["resiste", "Resiste a", "Nenhum tipo."],
  ["naoAfeta", "Não faz efeito em", "Nenhum: atinge todos."], ["imune", "É imune a", "Nenhum tipo."]
];

function linha(de, para, classe, ordem) {
  const t = trecho(lugar.get(de), lugar.get(para)), el = document.createElementNS(SVG, "line");
  for (const k of ["x1", "y1", "x2", "y2"]) el.setAttribute(k, t[k].toFixed(2));
  el.setAttribute("class", classe);
  el.setAttribute("pathLength", "1");
  el.style.setProperty("--i", ordem);
  return el;
}

function escolher(nome, gravar = true) {
  const r = relacoes(TABELA, TIPOS, nome);
  if (!r) return;
  for (const b of botoes) {
    const n = b.dataset.nome, eu = n === nome;
    b.setAttribute("aria-pressed", String(eu));
    b.classList.toggle("atingido", !eu && r.atinge.includes(n));
    b.classList.toggle("atacante", !eu && r.apanha.includes(n));
    b.classList.toggle("fora", !eu && !r.atinge.includes(n) && !r.apanha.includes(n));
  }
  // as linhas: o tipo contra ele mesmo (Dragão, Fantasma) não tem linha, só aparece nas listas
  linhas.replaceChildren(
    ...r.apanha.filter((n) => n !== nome).map((n, i) => linha(n, nome, "roda-linha roda-linha-apanha", i)),
    ...r.atinge.filter((n) => n !== nome).map((n, i) => linha(nome, n, "roda-linha roda-linha-atinge", i))
  );
  centro.innerHTML = `<strong>${nome}</strong><span>atinge ${r.atinge.length}</span><span>apanha de ${r.apanha.length}</span>`;
  centro.dataset.tipo = semAcento(nome);
  leitura.innerHTML = GRUPOS.map(([chave, titulo, vazio]) => `<div class="roda-grupo"><h2>${titulo}</h2>${r[chave].length ? `<p class="roda-selos">${r[chave].map((t) => selo(t)).join(" ")}</p>` : `<p class="nota-editorial">${vazio}</p>`}</div>`).join("");
  if (gravar) history.replaceState(null, "", `#${semAcento(nome)}`);
}

for (const b of botoes) b.addEventListener("click", () => escolher(b.dataset.nome));
// as setas do teclado andam pela roda, de tipo em tipo
raiz.querySelector(".roda-tipos").addEventListener("keydown", (e) => {
  const passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key], i = botoes.indexOf(document.activeElement);
  if (!passo || i < 0) return;
  e.preventDefault();
  const alvo = botoes[(i + passo + botoes.length) % botoes.length];
  alvo.focus();
  escolher(alvo.dataset.nome);
});

/* O tipo pedido no endereço; sem pedido, a roda abre no Fogo para já mostrar como se lê. */
const doEndereco = () => botoes.find((b) => b.dataset.tipo === decodeURIComponent(location.hash.slice(1)));
escolher((doEndereco() ?? botoes.find((b) => b.dataset.tipo === "fogo")).dataset.nome, false);
addEventListener("hashchange", () => { const b = doEndereco(); if (b) escolher(b.dataset.nome, false); });
