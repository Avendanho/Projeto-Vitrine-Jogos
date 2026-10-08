/* Página inicial: o aparelho que liga mostrando um perfil, e a cena em que o hexágono responde a cada pedido. */
import { EIXOS } from "./hexagono.js";
import { hexVivo, REDUZIDO } from "./hex-vivo.js";
import { JOGOS, PEDIDOS, DESTAQUES } from "./dados.js";

const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
const doisDigitos = (n) => String(n).padStart(2, "0");
const VAZIO = [0, 0, 0, 0, 0, 0];

/* ---------- abertura: a tela liga e passa pelos perfis em destaque ---------- */

function abertura() {
  const secao = document.querySelector(".abertura");
  if (!secao) return;
  const caixa = secao.querySelector(".abertura-hex"), ligacao = secao.querySelector("[data-perfil-atual]");
  const numero = secao.querySelector("[data-leitura-numero]"), nota = secao.querySelector("[data-leitura-nota]");
  const rotulos = [...caixa.querySelectorAll(".hex-eixo")], teclas = [...secao.querySelectorAll("[data-perfil]")];
  const destaques = DESTAQUES.map((s) => JOGOS.find((j) => j.slug === s));
  const desenho = hexVivo(caixa.querySelector("canvas"), { tema: "tela", pulso: true });
  let indice = 0, visivel = true, relogio = 0;

  function mostrar(j) {
    desenho.definir([{ valores: j.valores }]);
    // o vértice mais distante de cada perfil fica marcado no nome do eixo
    const maior = Math.max(...j.valores);
    rotulos.forEach((r, i) => r.classList.toggle("ativo", j.valores[i] === maior));
    ligacao.textContent = j.curto;
    ligacao.href = `/jogos/${j.slug}/`;
    numero.textContent = doisDigitos(indice + 1);
    nota.textContent = `${j.ano}, ${j.consoles}`;
    teclas.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.perfil === j.slug)));
  }
  // quem aperta uma tecla escolhe o perfil, e a troca automática para
  for (const tecla of teclas) tecla.addEventListener("click", () => {
    clearInterval(relogio);
    indice = destaques.findIndex((j) => j.slug === tecla.dataset.perfil);
    mostrar(destaques[indice]);
  });

  caixa.classList.add("vivo");
  if (REDUZIDO) { mostrar(destaques[0]); return; }
  // o perfil nasce do centro quando as tampas da tela terminam de abrir
  desenho.definir([{ valores: VAZIO }]);
  setTimeout(() => mostrar(destaques[0]), 700);
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(secao);
  relogio = setInterval(() => {
    if (!visivel || document.hidden) return;
    indice = (indice + 1) % destaques.length;
    mostrar(destaques[indice]);
  }, 5200);
}

/* ---------- pico: cada pedido puxa um vértice, e os trinta perfis em volta acendem ou apagam ---------- */

function pico() {
  const secao = document.querySelector(".pico");
  if (!secao) return;
  const caixa = secao.querySelector(".pico-hex");
  const desenho = hexVivo(caixa.querySelector("canvas"), { tema: "noite" });
  const rotulos = [...caixa.querySelectorAll(".hex-eixo")];
  const jogos = [...secao.querySelectorAll(".pico-jogos li")].map((el) => ({ el, jogo: JOGOS.find((j) => j.slug === el.dataset.slug) }));
  const eleitoDe = (eixo) => JOGOS.find((j) => j.slug === PEDIDOS[EIXOS[eixo].id].eleito);
  caixa.classList.add("vivo");

  // sem rolagem animada os pedidos viram uma lista, e o desenho mostra o hexágono cheio
  if (REDUZIDO) { desenho.definir([{ valores: [5, 5, 5, 5, 5, 5], cor: "#FFCB05", tracejado: [3, 4] }]); return; }

  const INTRO = 0.08, FIM = 0.87, TRECHO = (FIM - INTRO) / 6;
  let agendado = false, anterior = -2;

  function atualizar() {
    agendado = false;
    const r = secao.getBoundingClientRect(), percurso = secao.offsetHeight - window.innerHeight;
    if (percurso <= 0 || r.bottom < -300 || r.top > window.innerHeight + 300) return;
    const p = limitar(-r.top / percurso, 0, 1);

    // pedido: 0 é a introdução, 1 a 6 são os eixos, 7 é a pergunta final
    const pedido = p >= FIM ? 7 : p < INTRO ? 0 : Math.min(5, Math.floor((p - INTRO) / TRECHO)) + 1;
    if (pedido === anterior) return;
    anterior = pedido;
    secao.dataset.pedido = String(pedido);
    const eixo = pedido >= 1 && pedido <= 6 ? pedido - 1 : -1, eleito = eixo >= 0 ? eleitoDe(eixo) : null;

    rotulos.forEach((el, i) => el.classList.toggle("ativo", i === eixo));
    if (eleito) desenho.definir([{ valores: eleito.valores }]);
    else if (pedido === 0) desenho.definir([{ valores: VAZIO }]);
    else desenho.definir([{ valores: [5, 5, 5, 5, 5, 5], cor: "#FFCB05", tracejado: [3, 4] }]);
    // em volta, cada perfil acende conforme vai longe no eixo pedido; no fim, todos acendem
    for (const { el, jogo } of jogos) {
      el.style.setProperty("--brilho", (eleito ? 0.1 + 0.9 * (jogo.valores[eixo] / 5) ** 3 : pedido === 7 ? 1 : 0.32).toFixed(3));
      el.classList.toggle("eleito", jogo === eleito);
    }
  }

  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(atualizar); } };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  pedir();
}

abertura();
pico();
