/* Plano de caçada do Cobblemon: você marca os Pokémon que quer e a página diz em que bioma dá para achar
 * mais deles de uma vez. A lista fica guardada neste navegador e pode ir no endereço, para mandar a alguém.
 * A conta está em cacada-logica.js. */
import { BIOMAS, SPAWNS, ESPECIES, CONTEXTOS } from "./dados/spawns.js";
import { planejar, lerAlvos } from "./cacada-logica.js";

const CHAVE = "pokeatlas.cobblemon.cacada", RARIDADE = [["common", "Comum"], ["uncommon", "Incomum"], ["rare", "Raro"], ["ultra-rare", "Ultrarraro"]], MOSTRA = 6;
const raiz = document.querySelector("[data-cacada]");
const $ = (s) => raiz.querySelector(s);
const campo = $("#cacada-campo"), aviso = $("[data-aviso]"), caixaDosAlvos = $("[data-alvos]"), plano = $("[data-plano]");
const semAcento = (t) => String(t).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const porNumero = new Map(ESPECIES.map((e) => [e[0], e])), existe = (n) => porNumero.has(n);
const nome = (n) => porNumero.get(n)[2];
const lista = (itens) => (itens.length < 2 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`);
const slot = (n, lado) => `<a class="slot" data-n="${n}" href="${porNumero.get(n)[1]}" title="${nome(n)}" aria-label="${nome(n)}"><img class="tinta" src="/arte/modelo/${n}-tinta.png" data-cor="/arte/modelo/${n}.webp" alt="" width="${lado}" height="${lado}" loading="lazy" decoding="async"></a>`;

/* a lista do endereço vale para esta visita; a guardada só muda quando a pessoa mexe */
const doEndereco = new URLSearchParams(location.search).get("alvos");
let alvos = [], todos = false;
try { alvos = lerAlvos(JSON.parse(localStorage.getItem(CHAVE) || "[]"), existe); } catch { /* sem armazenamento, a lista vale só nesta visita */ }
if (doEndereco !== null) alvos = lerAlvos(doEndereco, existe);
function guardar() {
  try { localStorage.setItem(CHAVE, JSON.stringify(alvos)); } catch { /* idem */ }
  history.replaceState(null, "", alvos.length ? `?alvos=${alvos.join(",")}` : location.pathname);
}

function detalhe(regra) {
  const [, , contextos, nivel, hora, condicoes, forma] = regra;
  const como = contextos.map((c) => CONTEXTOS[c] ?? c).map((t, i) => (i ? t.toLowerCase() : t));
  return [lista(como), nivel[0] === nivel[1] ? `nível ${nivel[0]}` : `nível ${nivel[0]} a ${nivel[1]}`, forma ? `forma de ${forma}` : "", hora, ...condicoes].filter(Boolean).join(", ");
}

function desenhar() {
  $("[data-limpar]").hidden = $("[data-copiar]").hidden = !alvos.length;
  caixaDosAlvos.innerHTML = alvos.length
    ? `<ul class="cacada-lista">${alvos.map((n) => `<li>${slot(n, 64)}<span>${nome(n)}</span><button type="button" class="ligacao" data-tirar="${n}" aria-label="Tirar ${nome(n)} da lista">Tirar</button></li>`).join("")}</ul>`
    : '<p class="cacada-vazio">A lista está vazia. Ponha o primeiro Pokémon no campo acima, ou use o botão "Pôr na caçada" na página de qualquer espécie.</p>';
  const { lugares, semLugar } = planejar(alvos, SPAWNS);
  const visiveis = todos ? lugares : lugares.slice(0, MOSTRA);
  plano.innerHTML = !alvos.length ? "" : `
    ${semLugar.length ? `<p class="cacada-fora painel">${lista(semLugar.map(nome))} ${semLugar.length === 1 ? "não nasce" : "não nascem"} solto no mundo: vem de evolução, fóssil ou outro caminho. A página da espécie conta qual.</p>` : ""}
    ${lugares.length ? `<h2>Para onde ir</h2><p class="nota-editorial">Do bioma que rende mais alvos para o que rende menos. No empate, vem antes o que tem os alvos mais comuns.</p>` : ""}
    <ol class="cacada-lugares">${visiveis.map((l) => `<li class="painel cacada-lugar">
      <h3>${BIOMAS[l.bioma]}</h3>
      <p class="cacada-conta"><strong>${l.acha.length}</strong> de ${alvos.length} ${alvos.length === 1 ? "alvo" : "alvos"}</p>
      <ul>${l.acha.map((a) => `<li>${slot(a.n, 48)}<div><strong>${nome(a.n)}</strong><span class="raridade raridade-${RARIDADE[a.regras[0][0]][0]}">${RARIDADE[a.regras[0][0]][1]}</span><span>${detalhe(a.regras[0])}</span>${a.regras.length > 1 ? `<span class="cacada-mais">e mais ${a.regras.length - 1} ${a.regras.length === 2 ? "regra" : "regras"} neste bioma</span>` : ""}</div></li>`).join("")}</ul>
      ${l.falta.filter((n) => !semLugar.includes(n)).length ? `<p class="cb-onde">Aqui não: ${lista(l.falta.filter((n) => !semLugar.includes(n)).map(nome))}.</p>` : ""}
    </li>`).join("")}</ol>
    ${lugares.length > MOSTRA && !todos ? `<p><button type="button" class="botao botao-contorno" data-todos>Mostrar os ${lugares.length} biomas</button></p>` : ""}`;
}

function adicionar(texto) {
  aviso.textContent = "";
  const t = semAcento(texto);
  const exata = ESPECIES.find((e) => semAcento(e[2]) === t) ?? (/^\d+$/.test(t) ? porNumero.get(Number(t)) : null);
  const parecidas = exata ? [exata] : t.length >= 3 ? ESPECIES.filter((e) => semAcento(e[2]).startsWith(t)) : [];
  if (parecidas.length !== 1) { aviso.textContent = "Escolha um Pokémon da lista de sugestões."; return; }
  const n = parecidas[0][0];
  if (alvos.includes(n)) { aviso.textContent = `${nome(n)} já está na lista.`; return; }
  if (alvos.length >= 24) { aviso.textContent = "A lista comporta 24 Pokémon. Tire um para pôr outro."; return; }
  alvos.push(n);
  campo.value = "";
  guardar(); desenhar();
}

$("#lista-cacada").innerHTML = ESPECIES.map((e) => `<option value="${e[2]}">`).join("");
raiz.querySelector("form").addEventListener("submit", (e) => { e.preventDefault(); adicionar(campo.value); });
raiz.addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.tirar) { alvos = alvos.filter((n) => n !== Number(b.dataset.tirar)); aviso.textContent = ""; guardar(); desenhar(); }
  else if ("limpar" in b.dataset) { alvos = []; todos = false; aviso.textContent = ""; guardar(); desenhar(); campo.focus(); }
  else if ("todos" in b.dataset) { todos = true; desenhar(); }
  else if ("copiar" in b.dataset) {
    try { await Promise.race([navigator.clipboard.writeText(location.href), new Promise((_, recusar) => setTimeout(recusar, 900))]); b.textContent = "Link copiado"; }
    catch { aviso.textContent = "Não foi possível copiar. O link está na barra de endereço."; }
  }
});
desenhar();
