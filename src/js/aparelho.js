/* O que faz o aparelho funcionar como aparelho, além do que o próprio HTML já faz (os lados do direcional
 * são links): a tecla de baixo abre um Pokémon ao acaso, e digitar um número em qualquer página abre a
 * espécie com aquele número, como na Pokédex dos jogos. A lista de espécies só é pedida quando é usada. */
const cobblemon = document.body.classList.contains("edicao-cobblemon");
const ingles = document.documentElement.lang === "en";
let numeros = null;
const carregar = async () => (numeros ??= (await import("./dados/numeros.js")).NUMEROS);
/* Na edição Cobblemon, a espécie abre na página dela no mod, se ela existir por lá. */
const endereco = (linha) => (cobblemon && linha[2]) || linha[0];

document.querySelector("[data-acaso]")?.addEventListener("click", async () => {
  const lista = await carregar();
  location.href = endereco(lista[Math.floor(Math.random() * lista.length)]);
});

/* ---------- o número digitado ---------- */

let digitos = "", visor = null, espera = 0;
const ESPERA = 1100;                                 // quanto tempo sem tecla até o aparelho abrir a espécie

function mostrar(linha) {
  if (!visor) {
    visor = document.createElement("p");
    visor.className = "visor-numero";
    visor.setAttribute("role", "status");
    document.body.append(visor);
  }
  visor.hidden = false;
  visor.innerHTML = `<span>Nº ${digitos.padStart(4, "0")}</span><strong>${linha ? linha[1] : "???"}</strong>`;
  visor.classList.toggle("sem-registro", !linha);
}
function limpar() {
  digitos = "";
  clearTimeout(espera);
  if (visor) visor.hidden = true;
}

document.addEventListener("keydown", async (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
  // quem está escrevendo num campo, mexendo num controle ou com um painel aberto não está chamando a Pokédex
  if (e.target.closest?.("input, textarea, select, [contenteditable], [role='slider'], dialog") || document.querySelector("dialog[open]")) return;
  if (digitos && e.key === "Escape") { limpar(); return; }
  if (digitos && e.key === "Backspace") { e.preventDefault(); digitos = digitos.slice(0, -1); if (!digitos) { limpar(); return; } }
  else if (/^\d$/.test(e.key) && digitos.length < 4) digitos += e.key;
  else if (!(digitos && e.key === "Enter")) return;

  const lista = await carregar(), linha = lista[Number(digitos) - 1] ?? null;
  if (!digitos) return;                               // apagaram tudo enquanto a lista chegava
  mostrar(linha);
  clearTimeout(espera);
  const abrir = () => { if (linha) location.href = endereco(linha); else limpar(); };
  if (e.key === "Enter") { e.preventDefault(); abrir(); } else espera = setTimeout(abrir, linha ? ESPERA : ESPERA * 1.6);
});
if (ingles) document.documentElement.dataset.aparelho = "en";
