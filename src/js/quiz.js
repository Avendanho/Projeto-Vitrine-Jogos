/* Quem é esse Pokémon? Dois enigmas por dia: pela ficha (cada palpite revela o que bate) e pela gravura
 * (a tinta aparece aos poucos). As regras estão em quiz-logica.js; aqui é a página.
 * Os palpites do dia e a sequência ficam guardados no navegador. */
import { ESPECIES } from "./dados/especies.js";
import { especie, porId, porNome, procurarEspecie } from "./especies-logica.js";
import { diaDoQuiz, alvoDoDia, comparar, novaSequencia, sequenciaViva, resultadoEmTexto, MODOS, TENTATIVAS, FORCAS, PRIMEIRO_DIA } from "./quiz-logica.js";
import { gravar } from "./gravura.js";

const CHAVE = "pokeatlas.quiz", ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const raiz = document.querySelector("[data-quiz]");
const $ = (seletor) => raiz.querySelector(seletor);
const campo = $("#quiz-campo"), aviso = $("[data-aviso]"), fim = $("[data-fim]"), tabela = $("[data-tabela]"), lista = $("[data-lista]");
const caixaDaGravura = $("[data-gravura]"), tela = caixaDaGravura.querySelector("canvas"), formulario = $("[data-form]");
const numero = (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

/* O dia do enigma é o da hora em que a página abriu: quem vira a meia-noite no meio termina o que começou. */
const dia = diaDoQuiz(Date.now());
const alvos = Object.fromEntries(MODOS.map((m) => [m, especie(ESPECIES[alvoDoDia(dia, m, ESPECIES.length)])]));

let guardado = {};
try { guardado = JSON.parse(localStorage.getItem(CHAVE) || "{}") || {}; } catch { /* sem armazenamento, o jogo vale só nesta visita */ }
const palpites = Object.fromEntries(MODOS.map((m) => [m, guardado[m]?.dia === dia && Array.isArray(guardado[m].palpites) ? guardado[m].palpites.filter((id) => porId(ESPECIES, id)) : []]));
let sequencia = guardado.sequencia ?? null;
function guardar() {
  try { localStorage.setItem(CHAVE, JSON.stringify({ ...Object.fromEntries(MODOS.map((m) => [m, { dia, palpites: palpites[m] }])), sequencia })); } catch { /* idem */ }
}

let modo = location.hash === "#gravura" ? "gravura" : "ficha";
const venceu = (m) => palpites[m].includes(alvos[m].id);
const acabou = (m) => venceu(m) || palpites[m].length >= TENTATIVAS[m];

/* ---------- pela ficha ---------- */

const ROTULO = { tipo1: "Tipo 1", tipo2: "Tipo 2", geracao: "Geração", cor: "Cor", estagio: "Estágio", altura: "Altura", peso: "Peso" };
const mostrar = {
  tipo1: (v) => v, tipo2: (v) => v ?? "nenhum", geracao: (v) => ROMANOS[v], cor: (v) => v, estagio: (v) => `${v}º`, altura: (v) => `${numero(v)} m`, peso: (v) => `${numero(v)} kg`
};
const LEITURA = { certo: "bate", parcial: "existe, mas em outro lugar", errado: "não bate" };
function linhaDaFicha(id) {
  const e = especie(porId(ESPECIES, id));
  const celulas = comparar(e, alvos.ficha).map((p) => `<td class="pista pista-${p.estado}"><span>${mostrar[p.campo](p.valor)}</span>${p.seta ? `<span class="pista-seta" aria-hidden="true">${p.seta === "mais" ? "↑" : "↓"}</span>` : ""}<span class="so-leitor">: ${p.seta ? `o do dia tem ${p.seta}` : LEITURA[p.estado]}</span></td>`).join("");
  return `<tr><th scope="row"><span class="quiz-quem"><img src="/arte/mini/${e.id}.webp" alt="" width="44" height="44">${e.nome}</span></th>${celulas}</tr>`;
}

/* ---------- pela gravura ---------- */

let arte = null;
function desenharGravura() {
  const forca = acabou("gravura") ? 1 : FORCAS[Math.min(palpites.gravura.length, FORCAS.length - 1)];
  const pintar = () => { gravar(tela, arte, forca); caixaDaGravura.classList.toggle("revelada", acabou("gravura")); };
  if (arte?.complete && arte.naturalWidth) return pintar();
  if (!arte) { arte = new Image(); arte.src = `/arte/mini/${alvos.gravura.id}-cor.webp`; }
  arte.addEventListener("load", pintar, { once: true });
}

/* ---------- a página ---------- */

function desenhar() {
  for (const b of raiz.querySelectorAll("[data-modo]")) b.setAttribute("aria-pressed", String(b.dataset.modo === modo));
  $("[data-numero]").textContent = dia - PRIMEIRO_DIA + 1;
  const dias = sequenciaViva(sequencia, dia);
  $("[data-sequencia]").textContent = dias > 1 ? `Sequência: ${dias} dias` : dias === 1 ? "Sequência: 1 dia" : "";
  const lista_ = palpites[modo], encerrado = acabou(modo), alvo = alvos[modo];
  $("[data-restam]").textContent = encerrado ? "" : `${lista_.length} de ${TENTATIVAS[modo]} palpites`;
  formulario.hidden = encerrado;
  caixaDaGravura.hidden = modo !== "gravura";
  tabela.hidden = modo !== "ficha" || !lista_.length;
  lista.hidden = modo !== "gravura" || !lista_.length;
  $("[data-legenda]").hidden = modo !== "ficha";
  if (modo === "ficha") tabela.tBodies[0].innerHTML = [...lista_].reverse().map(linhaDaFicha).join("");
  else {
    lista.innerHTML = lista_.map((id) => `<li class="${id === alvo.id ? "acerto" : "erro"}">${especie(porId(ESPECIES, id)).nome}</li>`).join("");
    desenharGravura();
  }
  fim.hidden = !encerrado;
  if (encerrado) {
    fim.innerHTML = `<img src="/arte/mini/${alvo.id}-cor.webp" alt="" width="160" height="160">
      <div><h2>${venceu(modo) ? `Era ${alvo.nome}. Você acertou ${lista_.length === 1 ? "de primeira" : `em ${lista_.length} palpites`}.` : `Não foi dessa vez: era ${alvo.nome}.`}</h2>
      <p><a class="ligacao" href="/pokedex/${alvo.slug}/">Abrir a página de ${alvo.nome}</a></p>
      <p class="quiz-acoes"><button type="button" class="botao botao-contorno" data-copiar>Copiar o resultado</button>${MODOS.filter((m) => m !== modo && !acabou(m)).map((m) => `<button type="button" class="ligacao" data-ir="${m}">Jogar pela ${m}</button>`).join("")}</p>
      <p class="quiz-proximo">O próximo enigma sai à meia-noite, no horário de Brasília.</p>
      <textarea class="quiz-texto" data-texto readonly hidden rows="6" aria-label="Resultado para copiar"></textarea></div>`;
  }
}

function palpitar(l) {
  aviso.textContent = "";
  if (!l) { aviso.textContent = "Escolha um Pokémon da lista de sugestões."; return; }
  if (palpites[modo].includes(l[0])) { aviso.textContent = `${l[2]} já foi.`; return; }
  palpites[modo].push(l[0]);
  if (venceu(modo)) sequencia = novaSequencia(sequencia, dia);
  guardar();
  campo.value = "";
  desenhar();
}

$("#lista-especies").innerHTML = ESPECIES.map((l) => `<option value="${l[2]}">`).join("");
formulario.addEventListener("submit", (e) => { e.preventDefault(); palpitar(porNome(ESPECIES, campo.value) ?? (campo.value.trim().length >= 3 ? procurarEspecie(ESPECIES, campo.value, 2).length === 1 ? procurarEspecie(ESPECIES, campo.value, 1)[0] : null : null)); });
raiz.addEventListener("click", async (e) => {
  const troca = e.target.closest("[data-modo], [data-ir]");
  if (troca) { modo = troca.dataset.modo ?? troca.dataset.ir; history.replaceState(null, "", modo === "gravura" ? "#gravura" : location.pathname); aviso.textContent = ""; desenhar(); return; }
  const copiar = e.target.closest("[data-copiar]");
  if (!copiar) return;
  const linhas = modo === "ficha" ? palpites.ficha.map((id) => comparar(especie(porId(ESPECIES, id)), alvos.ficha)) : palpites.gravura.map((id) => id === alvos.gravura.id);
  const texto = `${resultadoEmTexto(linhas, dia, modo, venceu(modo))}\n${location.origin}/quiz/`;
  // se o navegador negar ou demorar a responder, o texto aparece para copiar à mão
  try { await Promise.race([navigator.clipboard.writeText(texto), new Promise((_, recusar) => setTimeout(recusar, 900))]); copiar.textContent = "Copiado"; }
  catch { const area = fim.querySelector("[data-texto]"); area.hidden = false; area.value = texto; area.select(); }
});
desenhar();
