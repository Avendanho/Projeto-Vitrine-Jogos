/* O som do atlas: uma música de fundo por edição, os sons das teclas e o grito de cada Pokémon.
 *
 * Tudo começa desligado. O botão de som do cabeçalho abre um painel pequeno, com a chave que liga e desliga
 * e um volume para a música e outro para as teclas; as escolhas ficam guardadas no navegador.
 * A música e os sons das teclas são feitos na hora, com osciladores (as partituras estão em som-logica.js);
 * só os gritos são arquivos, um por espécie, em /gritos/. O grito toca quando alguém pede, com o som do
 * atlas ligado ou não.
 */
import { MUSICAS, partitura } from "./som-logica.js";

const CHAVE = "pokeatlas.som", VOLUMES = "pokeatlas.som.volumes", POSICAO = "pokeatlas.som.passo";
const PADRAO = 80;                                   // onde os dois volumes começam, de 0 a 100
const edicao = document.body.classList.contains("edicao-cobblemon") ? "cobblemon" : "pokemon";
const musica = MUSICAS[edicao], folha = partitura(musica);
const botoes = [...document.querySelectorAll("[data-som]")];
const Contexto = window.AudioContext || window.webkitAudioContext;
/* O que o painel de som diz. As páginas em inglês (o início e a bússola) trazem o painel na língua delas. */
const T = document.documentElement.lang === "en"
  ? { som: "Sound", estado: (l) => `Sound: ${l ? "on" : "off"}`, ligar: "Turn sound on", desligar: "Turn sound off", musica: "Music", teclas: "Key sounds", gritos: "Each Pokémon's cry plays when you ask for it, whether the sound is on or not.", fechar: "Close", semGrito: "Could not play the cry in this browser.", parar: "Stop", semVoz: "This browser has no voice to read the entry." }
  : { som: "Som", estado: (l) => `Som: ${l ? "ligado" : "desligado"}`, ligar: "Ligar o som", desligar: "Desligar o som", musica: "Música", teclas: "Sons das teclas", gritos: "O grito de cada Pokémon toca quando você pede, com o som ligado ou não.", fechar: "Fechar", semGrito: "Não deu para tocar o grito neste navegador.", parar: "Parar", semVoz: "Este navegador não tem voz para ler a entrada." };

let ctx = null, barraMusica = null, nivelMusica = null, barraEfeitos = null, chiado = null, painel = null;
let ligado = false, tocando = false, relogio = 0, passo = 0, proximo = 0;
const volumes = { musica: PADRAO, teclas: PADRAO };
try {
  const lidos = JSON.parse(localStorage.getItem(VOLUMES) || "{}");
  for (const k of Object.keys(volumes)) if (Number.isFinite(lidos[k])) volumes[k] = Math.min(100, Math.max(0, Math.round(lidos[k])));
} catch { /* sem armazenamento ou com lixo guardado, valem os volumes de saída */ }
const ganho = (qual) => volumes[qual] / PADRAO;       // no volume de saída o ganho é 1

const guardado = () => { try { return localStorage.getItem(CHAVE) === "1"; } catch { return false; } };
const guardar = (v) => { try { localStorage.setItem(CHAVE, v ? "1" : "0"); } catch { /* sem armazenamento, a escolha vale só nesta página */ } };

function mostrar() {
  document.documentElement.dataset.som = ligado ? "ligado" : "desligado";
  for (const b of botoes) {
    b.dataset.ligado = String(ligado);
    if (b.hasAttribute("aria-label")) b.setAttribute("aria-label", T.estado(ligado));
  }
  const chave = painel?.querySelector("[data-som-chave]");
  if (chave) chave.textContent = ligado ? T.desligar : T.ligar;
}

function preparar() {
  if (ctx || !Contexto) return ctx;
  ctx = new Contexto();
  const saida = ctx.createGain();
  saida.gain.value = 0.9;
  saida.connect(ctx.destination);
  barraMusica = ctx.createGain();                    // a entrada e a saída suaves da música
  nivelMusica = ctx.createGain();                    // o volume que o visitante escolheu para ela
  barraEfeitos = ctx.createGain();
  nivelMusica.gain.value = ganho("musica");
  barraEfeitos.gain.value = ganho("teclas");
  barraMusica.connect(nivelMusica);
  nivelMusica.connect(saida);
  barraEfeitos.connect(saida);
  if (musica.eco) {                                   // o eco que deixa as notas soltas no ar
    const atraso = ctx.createDelay(1), volta = ctx.createGain();
    atraso.delayTime.value = folha.duracao * 1.5;
    volta.gain.value = musica.eco;
    barraMusica.connect(atraso); atraso.connect(volta); volta.connect(atraso); volta.connect(nivelMusica);
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

/* ---------- as luzes do aparelho ---------- */

/* As três luzes do alto da edição Pokémon acendem com a música: a vermelha no baixo, a amarela na melodia,
 * a verde na percussão. Quem pediu menos movimento fica sem o pisca-pisca. */
const LUZES = edicao === "pokemon" && !matchMedia("(prefers-reduced-motion: reduce)").matches;
const LUZ_DA_VOZ = [2, 0, 1, 3];                     // por voz da música: 1 vermelha, 2 amarela, 3 verde (0 não acende nada)
function acender(qual, quando) {
  if (!LUZES || !qual) return;
  setTimeout(() => {
    if (!tocando) return;
    const classe = `luz-${qual}`, raiz = document.documentElement;
    raiz.classList.add(classe);
    setTimeout(() => raiz.classList.remove(classe), 120);
  }, Math.max(0, (quando - ctx.currentTime) * 1000));
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
      acender(LUZ_DA_VOZ[e.voz], proximo);
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
  if (!alvo || alvo.matches("[data-som], [data-som-chave], [data-grito], [data-falar]")) return;
  efeito(edicao === "cobblemon" ? "estalo" : alvo.matches(".botao, .abertura-teclas button, .opcao") ? "tecla" : "toque");
});

/* ---------- o painel de som ---------- */

function alternar() {
  ligado = !ligado;
  guardar(ligado);
  mostrar();
  if (!ligado) { parar(); return; }
  if (!preparar()) return;
  ctx.resume().then(() => { efeito(edicao === "cobblemon" ? "estalo" : "ligar"); comecar(); }).catch(() => {});
}
function mudarVolume(qual, valor) {
  volumes[qual] = valor;
  try { localStorage.setItem(VOLUMES, JSON.stringify(volumes)); } catch { /* idem */ }
  if (ctx) (qual === "musica" ? nivelMusica : barraEfeitos).gain.setTargetAtTime(ganho(qual), ctx.currentTime, 0.03);
}
function abrirPainel() {
  if (!painel) {
    painel = document.createElement("dialog");
    painel.className = "som-painel";
    painel.setAttribute("aria-labelledby", "som-titulo");
    painel.innerHTML = `<h2 id="som-titulo">${T.som}</h2>
      <button type="button" class="botao" data-som-chave></button>
      <label class="som-volume"><span>${T.musica}</span><input type="range" min="0" max="100" step="5" value="${volumes.musica}" data-volume="musica"></label>
      <label class="som-volume"><span>${T.teclas}</span><input type="range" min="0" max="100" step="5" value="${volumes.teclas}" data-volume="teclas"></label>
      <p class="nota-editorial">${T.gritos}</p>
      <button type="button" class="ligacao" data-som-fechar>${T.fechar}</button>`;
    document.body.append(painel);
    painel.querySelector("[data-som-chave]").addEventListener("click", alternar);
    painel.querySelector("[data-som-fechar]").addEventListener("click", () => painel.close());
    painel.addEventListener("click", (e) => { if (e.target === painel) painel.close(); });   // o toque fora da caixa fecha
    for (const campo of painel.querySelectorAll("[data-volume]")) {
      campo.addEventListener("input", () => mudarVolume(campo.dataset.volume, Number(campo.value)));
      // ao soltar o volume das teclas, uma tecla soa para dar a medida
      if (campo.dataset.volume === "teclas") campo.addEventListener("change", () => efeito(edicao === "cobblemon" ? "estalo" : "tecla"));
    }
    mostrar();
  }
  document.getElementById("menu")?.classList.remove("aberto");      // no celular o botão fica dentro do menu
  if (painel.showModal) painel.showModal(); else painel.setAttribute("open", "");
}
for (const b of botoes) b.addEventListener("click", abrirPainel);

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
  const fim = () => { botao.classList.remove("tocando"); document.documentElement.classList.remove("tocando-grito"); };
  document.documentElement.classList.add("tocando-grito");   // as luzes do aparelho piscam enquanto o grito soa
  grito.addEventListener("ended", fim);
  grito.addEventListener("pause", fim);
  botao.classList.add("tocando");
  grito.play().catch(() => { fim(); if (aviso) aviso.textContent = T.semGrito; });
});

/* ---------- a Pokédex que fala ---------- */

/* O botão lê a entrada em voz alta com a voz do próprio navegador, como a Pokédex do desenho. Só aparece
 * onde o navegador sabe falar, e funciona com o som do atlas ligado ou não. */
const fala = window.speechSynthesis;
if (fala && window.SpeechSynthesisUtterance) {
  const falantes = [...document.querySelectorAll("[data-falar]")];
  let ativo = null;
  const calar = () => {
    if (!ativo) return;
    ativo.textContent = ativo.dataset.rotulo;
    ativo.classList.remove("tocando");
    document.documentElement.classList.remove("falando");
    ativo = null;
  };
  for (const botao of falantes) {
    botao.hidden = false;
    botao.dataset.rotulo = botao.textContent;
    botao.addEventListener("click", () => {
      const era = ativo;
      fala.cancel();
      calar();
      if (era === botao) return;                      // o segundo toque só interrompe
      const aviso = botao.parentElement.querySelector("[data-grito-aviso]"), lingua = botao.dataset.lingua;
      const frase = new SpeechSynthesisUtterance(botao.dataset.falar);
      frase.lang = lingua;
      frase.voice = fala.getVoices().find((v) => v.lang === lingua) ?? fala.getVoices().find((v) => v.lang.startsWith(lingua.slice(0, 2))) ?? null;
      frase.rate = 0.95;
      frase.pitch = 0.85;                             // um pouco mais grave, com cara de aparelho
      frase.onend = calar;
      frase.onerror = (e) => { calar(); if (aviso && e.error !== "interrupted" && e.error !== "canceled") aviso.textContent = T.semVoz; };
      if (aviso) aviso.textContent = "";
      ativo = botao;
      botao.textContent = T.parar;
      botao.classList.add("tocando");
      document.documentElement.classList.add("falando");
      fala.speak(frase);
    });
  }
  addEventListener("pagehide", () => fala.cancel());
}

ligado = guardado() && Boolean(Contexto);
mostrar();
if (ligado) acordar();
