/* O som do atlas: uma música de fundo por edição, os sons das teclas e o grito de cada Pokémon.
 *
 * Tudo começa desligado. Quem liga é o botão de som do cabeçalho, e a escolha fica guardada no navegador.
 * A música e os sons das teclas são feitos na hora, com osciladores (as partituras estão em som-logica.js);
 * só os gritos são arquivos, um por espécie, em /gritos/. O grito toca quando alguém pede, com o som do
 * atlas ligado ou não.
 */
import { MUSICAS, partitura } from "./som-logica.js";

const CHAVE = "pokeatlas.som", POSICAO = "pokeatlas.som.passo";
const edicao = document.body.classList.contains("edicao-cobblemon") ? "cobblemon" : "pokemon";
const musica = MUSICAS[edicao], folha = partitura(musica);
const botoes = [...document.querySelectorAll("[data-som]")];
const Contexto = window.AudioContext || window.webkitAudioContext;

let ctx = null, barraMusica = null, barraEfeitos = null, chiado = null;
let ligado = false, tocando = false, relogio = 0, passo = 0, proximo = 0;

const guardado = () => { try { return localStorage.getItem(CHAVE) === "1"; } catch { return false; } };
const guardar = (v) => { try { localStorage.setItem(CHAVE, v ? "1" : "0"); } catch { /* sem armazenamento, a escolha vale só nesta página */ } };

function mostrar() {
  document.documentElement.dataset.som = ligado ? "ligado" : "desligado";
  for (const b of botoes) b.setAttribute("aria-pressed", String(ligado));
}

function preparar() {
  if (ctx || !Contexto) return ctx;
  ctx = new Contexto();
  const saida = ctx.createGain();
  saida.gain.value = 0.9;
  saida.connect(ctx.destination);
  barraMusica = ctx.createGain();
  barraEfeitos = ctx.createGain();
  barraMusica.connect(saida);
  barraEfeitos.connect(saida);
  if (musica.eco) {                                   // o eco que deixa as notas soltas no ar
    const atraso = ctx.createDelay(1), volta = ctx.createGain();
    atraso.delayTime.value = folha.duracao * 1.5;
    volta.gain.value = musica.eco;
    barraMusica.connect(atraso); atraso.connect(volta); volta.connect(atraso); volta.connect(saida);
  }
  const amostras = ctx.sampleRate * 0.25, dados = new Float32Array(amostras);
  for (let i = 0; i < amostras; i++) dados[i] = Math.random() * 2 - 1;
  chiado = ctx.createBuffer(1, amostras, ctx.sampleRate);
  chiado.copyToChannel(dados, 0);
  return ctx;
}

/* Uma nota: oscilador com ataque curto e a soltura pedida. `quando` é a hora do contexto, em segundos. */
function nota(destino, freq, quando, dura, { onda = "square", volume = 0.05, solta = 0.08, ate = null } = {}) {
  const osc = ctx.createOscillator(), ganho = ctx.createGain();
  osc.type = onda;
  osc.frequency.setValueAtTime(freq, quando);
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, quando + dura);
  ganho.gain.setValueAtTime(0, quando);
  ganho.gain.linearRampToValueAtTime(volume, quando + 0.012);
  ganho.gain.setValueAtTime(volume, quando + Math.max(0.012, dura - 0.02));
  ganho.gain.exponentialRampToValueAtTime(0.0001, quando + dura + solta);
  osc.connect(ganho); ganho.connect(destino);
  osc.start(quando); osc.stop(quando + dura + solta + 0.05);
}
function batida(destino, quando, volume, solta) {
  const fonte = ctx.createBufferSource(), filtro = ctx.createBiquadFilter(), ganho = ctx.createGain();
  fonte.buffer = chiado;
  filtro.type = "highpass"; filtro.frequency.value = 6000;
  ganho.gain.setValueAtTime(volume, quando);
  ganho.gain.exponentialRampToValueAtTime(0.0001, quando + solta + 0.02);
  fonte.connect(filtro); filtro.connect(ganho); ganho.connect(destino);
  fonte.start(quando); fonte.stop(quando + solta + 0.05);
}

/* ---------- música ---------- */

/* Agenda com folga: a cada volta, marca as notas dos próximos instantes na hora do contexto. */
function agendar() {
  while (proximo < ctx.currentTime + 0.3) {
    for (const e of folha.eventos) {
      if (e.passo !== passo) continue;
      const voz = musica.vozes[e.voz];
      if (voz.onda === "ruido") batida(barraMusica, proximo, voz.volume, voz.solta);
      else nota(barraMusica, e.freq, proximo, e.passos * folha.duracao * 0.92, voz);
    }
    passo = (passo + 1) % folha.passos;
    proximo += folha.duracao;
  }
}
function comecar() {
  if (tocando || !ligado || !preparar() || ctx.state !== "running") return;
  tocando = true;
  // quem troca de página continua a música mais ou menos de onde ela estava, no começo de um compasso
  try {
    const [onde, p] = (sessionStorage.getItem(POSICAO) || "").split(":");
    if (onde === edicao && Number(p) < folha.passos) passo = Math.floor(Number(p) / 8) * 8;
  } catch { /* começa do início */ }
  barraMusica.gain.cancelScheduledValues(ctx.currentTime);
  barraMusica.gain.setValueAtTime(0, ctx.currentTime);
  barraMusica.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
  proximo = ctx.currentTime + 0.08;
  agendar();
  relogio = setInterval(agendar, 90);
}
function parar() {
  clearInterval(relogio);
  tocando = false;
  if (ctx) barraMusica.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
}

/* O navegador só deixa o som sair depois de um gesto de quem visita. Se a página abriu com o som ligado
 * (escolha guardada) e o contexto nasceu parado, a música espera o primeiro toque ou tecla. */
function acordar() {
  if (!ligado || !preparar()) return;
  if (ctx.state === "running") { comecar(); return; }
  ctx.resume().then(comecar).catch(() => {});
}
for (const gesto of ["pointerdown", "keydown"]) document.addEventListener(gesto, () => { if (ligado && !tocando) acordar(); }, { passive: true });
document.addEventListener("visibilitychange", () => {
  if (!ctx || !ligado) return;
  if (document.hidden) { parar(); ctx.suspend().catch(() => {}); } else acordar();
});
addEventListener("pagehide", () => { if (tocando) { try { sessionStorage.setItem(POSICAO, `${edicao}:${passo}`); } catch { /* idem */ } } });

/* ---------- sons das teclas ---------- */

const EFEITOS = {
  // edição Pokémon: bipes de portátil
  toque: (t) => nota(barraEfeitos, 1320, t, 0.035, { onda: "square", volume: 0.035, solta: 0.03 }),
  tecla: (t) => { nota(barraEfeitos, 660, t, 0.04, { onda: "square", volume: 0.045, solta: 0.03 }); nota(barraEfeitos, 990, t + 0.045, 0.05, { onda: "square", volume: 0.045, solta: 0.05 }); },
  ligar: (t) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => nota(barraEfeitos, f, t + i * 0.075, 0.07, { onda: "square", volume: 0.05, solta: 0.08 })),
  // edição Cobblemon: o estalo de madeira dos menus em blocos
  estalo: (t) => { nota(barraEfeitos, 420, t, 0.03, { onda: "triangle", volume: 0.12, solta: 0.04, ate: 180 }); batida(barraEfeitos, t, 0.02, 0.02); }
};
export function efeito(nome) {
  if (!ligado || !ctx || ctx.state !== "running") return;
  EFEITOS[nome]?.(ctx.currentTime + 0.005);
}
document.addEventListener("click", (e) => {
  if (!ligado) return;
  const alvo = e.target.closest?.("a, button, summary, select, [role='button']");
  if (!alvo || alvo.matches("[data-som], [data-grito]")) return;
  efeito(edicao === "cobblemon" ? "estalo" : alvo.matches(".botao, .abertura-teclas button, .opcao") ? "tecla" : "toque");
});

/* ---------- o botão de som ---------- */

for (const b of botoes) b.addEventListener("click", () => {
  ligado = !ligado;
  guardar(ligado);
  mostrar();
  if (!ligado) { parar(); return; }
  if (!preparar()) return;
  ctx.resume().then(() => { efeito(edicao === "cobblemon" ? "estalo" : "ligar"); comecar(); }).catch(() => {});
});

/* ---------- gritos ---------- */

let grito = null;
document.addEventListener("click", (e) => {
  const botao = e.target.closest?.("[data-grito]");
  if (!botao) return;
  const aviso = botao.parentElement.querySelector("[data-grito-aviso]");
  if (aviso) aviso.textContent = "";
  grito?.pause();
  grito = new Audio(botao.dataset.grito);
  grito.volume = 0.7;
  const fim = () => botao.classList.remove("tocando");
  grito.addEventListener("ended", fim);
  grito.addEventListener("pause", fim);
  botao.classList.add("tocando");
  grito.play().catch(() => { fim(); if (aviso) aviso.textContent = "Não deu para tocar o grito neste navegador."; });
});

ligado = guardado() && Boolean(Contexto);
mostrar();
if (ligado) acordar();
