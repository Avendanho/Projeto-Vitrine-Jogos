/* Página inicial: o mar da abertura e a agulha da bússola. */
import { criarMalha, calcular, desenhar, TINTAS, EIXOS } from "./relevo.js";
import { JOGOS, PEDIDOS, DESTAQUES } from "./dados.js";
import { REDUZIDO } from "./ilha-viva.js";

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const suavizar = (t) => t * t * (3 - 2 * t);

/* ---------- abertura: uma ilha viva num mar que responde ao ponteiro e à rolagem ---------- */

function abertura() {
  const secao = document.querySelector(".abertura");
  if (!secao) return;
  const canvas = secao.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const rotulos = [...secao.querySelectorAll(".abertura-eixos span")];
  const ligacao = secao.querySelector("[data-ilha-atual]");
  const destaques = DESTAQUES.map((s) => JOGOS.find((j) => j.slug === s));
  const direcoes = EIXOS.map((e) => [Math.cos((e.ang * Math.PI) / 180), Math.sin((e.ang * Math.PI) / 180)]);

  let indice = 0;
  const alvo = destaques[0].valores.slice();
  const atual = alvo.slice();
  let w = 0, h = 0, dpr = 1, celula = 11, malha = null, escala = 1, cx = 0, cy = 0, margem = 0;
  let subida = REDUZIDO ? 1 : 0;
  let visivel = true, quadro = 0, lentos = 0;
  const toque = { x: 0, y: 0, forca: 0, alvoX: 0, alvoY: 0, alvoForca: 0 };
  const inicio = performance.now();

  function medir() {
    const r = secao.getBoundingClientRect();
    w = r.width; h = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const largo = w >= 900;
    escala = largo ? Math.min(w * 0.26, h * 0.36) : Math.min(w * 0.47, h * 0.22);
    cx = largo ? w * 0.7 : w * 0.5;
    cy = largo ? h * 0.47 : h * 0.31;
    margem = celula * 2;
    const gx = Math.ceil(w / celula) + 5, gy = Math.ceil(h / celula) + 5;
    malha = criarMalha(gx, gy,
      (-margem - cx) / escala, ((gx - 1) * celula - margem - cx) / escala,
      (-margem - cy) / escala, ((gy - 1) * celula - margem - cy) / escala);
  }

  function pintar(tempo) {
    const mare = 1 - 0.94 * suavizar(limitar(window.scrollY / (h * 0.82), 0, 1));
    const emersao = suavizar(subida) * mare;
    calcular(malha, atual, { semente: 7, emersao, tempo, toque });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    desenhar(ctx, malha, { ox: -margem * dpr, oy: -margem * dpr, sx: celula * dpr, sy: celula * dpr }, TINTAS.dia, { mar: true, traco: dpr });

    rotulos.forEach((el, i) => {
      const raio = (0.16 + 0.085 * atual[i] + 0.44) * escala;
      const x = limitar(cx + direcoes[i][0] * raio, 52, w - 52);
      const y = cy + direcoes[i][1] * raio;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      el.style.opacity = (emersao * emersao).toFixed(3);
    });
  }

  function laco(agora) {
    quadro = 0;
    if (!visivel) return;
    for (let i = 0; i < 6; i++) atual[i] += (alvo[i] - atual[i]) * 0.035;
    if (subida < 1) subida = Math.min(1, subida + 0.011);
    toque.x += (toque.alvoX - toque.x) * 0.16;
    toque.y += (toque.alvoY - toque.y) * 0.16;
    toque.forca += (toque.alvoForca - toque.forca) * 0.07;

    const antes = performance.now();
    pintar((agora - inicio) / 1000);
    // máquina lenta: malha mais grossa em vez de rolagem travada
    lentos = performance.now() - antes > 13 ? lentos + 1 : 0;
    if (lentos > 12 && celula < 20) { celula = Math.round(celula * 1.35); lentos = 0; medir(); }
    quadro = requestAnimationFrame(laco);
  }

  medir();
  if (REDUZIDO) {
    pintar(0);
    window.addEventListener("resize", () => { medir(); pintar(0); });
    return;
  }

  window.addEventListener("resize", medir);
  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel && !quadro) quadro = requestAnimationFrame(laco);
  }).observe(secao);

  if (matchMedia("(pointer: fine)").matches) {
    secao.addEventListener("pointermove", (e) => {
      const r = secao.getBoundingClientRect();
      toque.alvoX = (e.clientX - r.left - cx) / escala;
      toque.alvoY = (e.clientY - r.top - cy) / escala;
      toque.alvoForca = 1.5;
    });
    secao.addEventListener("pointerleave", () => { toque.alvoForca = 0; });
  }

  setInterval(() => {
    if (!visivel || document.hidden) return;
    indice = (indice + 1) % destaques.length;
    const j = destaques[indice];
    for (let i = 0; i < 6; i++) alvo[i] = j.valores[i];
    ligacao.textContent = j.curto;
    ligacao.href = `/jogos/${j.slug}/`;
  }, 6000);
}

/* ---------- pico: a agulha gira com a rolagem e as ilhas se apagam ---------- */

function pico() {
  const secao = document.querySelector(".pico");
  if (!secao || REDUZIDO) return;
  const ilhas = [...secao.querySelectorAll(".pico-ilha")].map((el) => ({
    el, jogo: JOGOS.find((j) => j.slug === el.dataset.slug)
  }));
  const direcoes = [...secao.querySelectorAll(".pico-direcao")];
  const INTRO = 0.07, FIM = 0.87, TRECHO = (FIM - INTRO) / 6, GIRO = 0.36;
  let agendado = false;

  function atualizar() {
    agendado = false;
    const r = secao.getBoundingClientRect();
    const percurso = secao.offsetHeight - window.innerHeight;
    if (percurso <= 0 || r.bottom < -300 || r.top > window.innerHeight + 300) return;
    const p = limitar(-r.top / percurso, 0, 1);

    let pedido = 0, angulo = 0, eixo = -1, anterior = -1, mistura = 1;
    if (p < INTRO) {
      angulo = -36 * (1 - suavizar(p / INTRO));
    } else if (p >= FIM) {
      pedido = 7;
      angulo = 300 + 60 * suavizar((p - FIM) / (1 - FIM));
    } else {
      const q = (p - INTRO) / TRECHO;
      eixo = Math.min(5, Math.floor(q));
      anterior = eixo - 1;
      mistura = suavizar(limitar((q - eixo) / GIRO, 0, 1));
      angulo = eixo === 0 ? 0 : (eixo - 1) * 60 + 60 * mistura;
      pedido = mistura > 0.5 ? eixo + 1 : eixo;
    }

    secao.dataset.pedido = String(pedido);
    secao.style.setProperty("--agulha", `${angulo.toFixed(2)}deg`);
    const ativo = pedido >= 1 && pedido <= 6 ? EIXOS[pedido - 1].id : null;
    direcoes.forEach((d) => d.classList.toggle("ativo", d.dataset.eixo === ativo));

    for (const { el, jogo } of ilhas) {
      let brilho = 0, porte = 1, eleita = false;
      if (pedido === 7) {
        brilho = suavizar(limitar((p - FIM) / ((1 - FIM) * 0.5), 0, 1));
      } else if (eixo >= 0) {
        const de = anterior >= 0 ? jogo.valores[anterior] / 5 : 0.72;
        const peso = de + (jogo.valores[eixo] / 5 - de) * mistura;
        brilho = peso ** 3.4;
        porte = 0.78 + 0.5 * peso * peso;
        eleita = mistura > 0.8 && jogo.slug === PEDIDOS[EIXOS[eixo].id].eleito;
      }
      el.style.setProperty("--brilho", brilho.toFixed(3));
      el.style.setProperty("--porte", porte.toFixed(3));
      el.classList.toggle("eleita", eleita);
    }
  }

  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  pedir();
}

abertura();
pico();
