/* Lista de Pokémon do Cobblemon: busca e filtros por ambiente, raridade, tipo e montaria.
 * O que está escolhido fica no endereço. */
import { semAcento } from "./gaveta.js";

const secao = document.querySelector("[data-cb-lista]");
const campo = secao.querySelector("#dex-procurar");
const itens = [...secao.querySelectorAll(".gaveta > li")];
const botoes = [...secao.querySelectorAll("button[data-filtro]")];
const contagem = secao.querySelector("[data-dex-contagem]");
const rotulo = secao.querySelector("[data-dex-rotulo]");
const limpar = secao.querySelector("[data-dex-limpar]");
const faltam = secao.querySelector("[data-dex-faltam]");
const vazio = secao.querySelector("[data-dex-vazio]");

const CHAVES = ["ambiente", "raridade", "tipo", "monta"];
const inicial = new URLSearchParams(location.search);
const estado = { q: inicial.get("q") || "", faltam: false };
for (const c of CHAVES) {
  const v = inicial.get(c) || "";
  estado[c] = botoes.some((b) => b.dataset.filtro === c && b.dataset.valor === v) ? v : "";
}
campo.value = estado.q;

function aplicar(gravar = true) {
  const texto = semAcento(estado.q);
  const numero = /^\d+$/.test(texto) ? Number(texto) : null;
  let visiveis = 0;
  for (const li of itens) {
    const d = li.dataset;
    const ok = (estado.faltam || !("falta" in d)) &&
      (!texto || (numero !== null ? Number(d.n) === numero : d.nome.includes(texto))) &&
      (!estado.ambiente || d.ambientes.split(" ").includes(estado.ambiente)) &&
      (!estado.raridade || d.raridade === estado.raridade) &&
      (!estado.tipo || d.tipos.split(" ").includes(estado.tipo)) &&
      (!estado.monta || "monta" in d);
    li.hidden = !ok;
    if (ok) visiveis++;
  }
  for (const b of botoes) b.setAttribute("aria-pressed", String(estado[b.dataset.filtro] === b.dataset.valor));
  faltam.setAttribute("aria-pressed", String(estado.faltam));
  contagem.textContent = visiveis.toLocaleString("pt-BR");
  rotulo.textContent = visiveis === 1 ? "espécie" : "espécies";
  limpar.hidden = !(estado.q || CHAVES.some((c) => estado[c]));
  vazio.hidden = visiveis > 0;
  if (gravar) {
    const busca = new URLSearchParams();
    if (estado.q) busca.set("q", estado.q);
    for (const c of CHAVES) if (estado[c]) busca.set(c, estado[c]);
    const endereco = busca.toString();
    history.replaceState(null, "", endereco ? `?${endereco}` : location.pathname);
  }
}

campo.addEventListener("input", () => { estado.q = campo.value.trim(); aplicar(); });
for (const b of botoes) {
  b.addEventListener("click", () => {
    const c = b.dataset.filtro;
    estado[c] = estado[c] === b.dataset.valor ? "" : b.dataset.valor;
    aplicar();
  });
}
limpar.addEventListener("click", () => { estado.q = ""; campo.value = ""; for (const c of CHAVES) estado[c] = ""; aplicar(); campo.focus(); });
faltam.addEventListener("click", () => { estado.faltam = !estado.faltam; aplicar(); });
secao.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const sobraram = itens.filter((li) => !li.hidden && li.querySelector("a"));
  if (sobraram.length === 1) sobraram[0].querySelector("a").click();
});
aplicar(false);
