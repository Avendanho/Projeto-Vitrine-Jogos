/* A busca global: um campo que acha jogos, regiões, Pokémon, desafios, ferramentas e, do Cobblemon, Pokémon,
 * itens, estruturas e biomas, de qualquer página. Este módulo e o índice só são baixados quando alguém abre
 * a busca pela primeira vez (src/js/base.js). A ordem dos resultados está em busca-logica.js. */
import { INDICE } from "./dados/busca.js";
import { procurar } from "./busca-logica.js";

const edicao = document.body.classList.contains("edicao-cobblemon") ? "cobblemon" : "pokemon";
const OUTRA = { pokemon: "no Cobblemon", cobblemon: "nos jogos" };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const caixa = document.createElement("dialog");
caixa.className = "busca";
caixa.setAttribute("aria-label", "Buscar no atlas");
caixa.innerHTML = `<form method="dialog" class="busca-campo">
    <label for="busca-texto" class="so-leitor">Buscar no atlas</label>
    <input id="busca-texto" type="search" placeholder="Pokémon, jogo, item, estrutura, desafio" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="false" aria-controls="busca-resultados" aria-autocomplete="list">
    <button type="submit" class="ligacao">Fechar</button>
  </form>
  <ul id="busca-resultados" class="busca-resultados" role="listbox" aria-label="Resultados"></ul>
  <p class="busca-dica" data-dica>Digite pelo menos duas letras, ou o número de um Pokémon. As setas escolhem e Enter abre.</p>`;
document.body.append(caixa);
const campo = caixa.querySelector("input"), lista = caixa.querySelector("ul"), dica = caixa.querySelector("[data-dica]");
let ativo = -1;

function marcar(i) {
  const itens = [...lista.children];
  ativo = itens.length ? (i + itens.length) % itens.length : -1;
  itens.forEach((li, k) => li.setAttribute("aria-selected", String(k === ativo)));
  if (ativo >= 0) { itens[ativo].scrollIntoView({ block: "nearest" }); campo.setAttribute("aria-activedescendant", itens[ativo].id); }
  else campo.removeAttribute("aria-activedescendant");
}
function desenhar() {
  const texto = campo.value.trim(), achados = texto.length >= 2 || /^\d+$/.test(texto) ? procurar(INDICE, texto, edicao) : [];
  lista.innerHTML = achados.map(([tipo, nome, url, de], i) => `<li id="busca-r${i}" role="option" aria-selected="false"><a href="${esc(url)}" tabindex="-1"><span class="busca-tipo">${tipo}${de !== edicao ? ` ${OUTRA[edicao]}` : ""}</span><span class="busca-nome">${esc(nome)}</span></a></li>`).join("");
  campo.setAttribute("aria-expanded", String(achados.length > 0));
  dica.textContent = achados.length ? "" : texto.length >= 2 ? `Nada com "${texto}" no atlas.` : "Digite pelo menos duas letras, ou o número de um Pokémon. As setas escolhem e Enter abre.";
  marcar(achados.length ? 0 : -1);
}
campo.addEventListener("input", desenhar);
campo.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); marcar(ativo + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); marcar(ativo - 1); }
  else if (e.key === "Enter" && ativo >= 0) { e.preventDefault(); lista.children[ativo].querySelector("a").click(); }
  else if (e.key === "Escape") { e.preventDefault(); caixa.close(); }      // num campo de busca o navegador gastaria o primeiro Esc só para limpar o texto
});
lista.addEventListener("click", () => caixa.close());           // o link navega; a caixa some, inclusive quando o destino é uma âncora da mesma página
caixa.addEventListener("click", (e) => { if (e.target === caixa) caixa.close(); });   // clique fora da caixa fecha

export function abrirBusca() {
  if (caixa.open) return;
  caixa.showModal();
  campo.select();
  desenhar();
}
