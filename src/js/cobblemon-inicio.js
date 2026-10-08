/* Início da edição Cobblemon: o mapa em blocos.
 *
 * O terreno é sorteado por ruído e pintado em células, com as cores e o
 * sombreado do item "mapa" do Minecraft. Na abertura ele começa em branco e se
 * revela em volta de um marcador, como um mapa do jogo se preenche por onde o
 * jogador anda. Na cena dos ambientes, o mapa inteiro aparece e só o ambiente
 * da vez fica aceso; caverna, Nether e Fim trocam o mapa de dimensão. */
import { ruido } from "./ruido.js";

const PARADO = matchMedia("(prefers-reduced-motion: reduce)").matches;
const PAPEL = [220, 203, 159];

/* cada classe de terreno: três tons (sombra, base, luz) e o ambiente do atlas a que pertence */
const TERRENOS = {
  fundo: { tons: ["#33479F", "#3C54BA", "#4460D1"], ambiente: "oceano" },
  mar: { tons: ["#4460D1", "#5273E6", "#5F82F2"], ambiente: "oceano" },
  rio: { tons: ["#5A86E0", "#6A98EF", "#79A6F5"], ambiente: "agua-doce" },
  areia: { tons: ["#D0C489", "#E8DA99", "#F7E9A3"], ambiente: "oceano" },
  campo: { tons: ["#6C9830", "#7FB238", "#8DC43E"], ambiente: "campo" },
  floresta: { tons: ["#37692A", "#427C32", "#4C8E3A"], ambiente: "floresta" },
  selva: { tons: ["#1F7A2B", "#279234", "#2EA53B"], ambiente: "selva" },
  pantano: { tons: ["#4B6537", "#587640", "#648548"], ambiente: "agua-doce" },
  deserto: { tons: ["#C9A655", "#DDB960", "#EBC76B"], ambiente: "arido" },
  savana: { tons: ["#A3913F", "#B8A448", "#C8B350"], ambiente: "arido" },
  pedra: { tons: ["#676767", "#7C7C7C", "#8E8E8E"], ambiente: "montanha" },
  neve: { tons: ["#C9D3DD", "#E3EAF0", "#FFFFFF"], ambiente: "frio" },
  gelo: { tons: ["#8F9BE0", "#A0AEF4", "#B3BEFA"], ambiente: "frio" }
};
/* as outras dimensões: paleta própria, sem ligação com o terreno da superfície */
const DIMENSOES = {
  caverna: ["#2E2E33", "#3B3B41", "#4A4A51", "#5C5C63", "#3F7F6A"],
  nether: ["#4A1010", "#641818", "#7C2222", "#933030", "#E0752A"],
  fim: ["#0C0B14", "#14121F", "#D9D7A0", "#E8E6B4", "#B79AD0"]
};
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
for (const t of Object.values(TERRENOS)) t.rgb = t.tons.map(hex);
const NOMES = Object.keys(TERRENOS);

function gerar(colunas, linhas, semente) {
  const n = colunas * linhas;
  const classe = new Uint8Array(n), tom = new Uint8Array(n), alto = new Float32Array(n);
  const e = 1 / Math.max(colunas, linhas);
  for (let y = 0; y < linhas; y++) {
    for (let x = 0; x < colunas; x++) {
      const u = x * e * 5.2, v = y * e * 5.2;
      alto[y * colunas + x] = 0.5 + 0.34 * ruido(u, v, semente) + 0.16 * ruido(u * 2.3, v * 2.3, semente + 5) + 0.07 * ruido(u * 5.1, v * 5.1, semente + 9);
    }
  }
  for (let y = 0; y < linhas; y++) {
    for (let x = 0; x < colunas; x++) {
      const i = y * colunas + x, h = alto[i];
      const u = x * e * 3.1, v = y * e * 3.1;
      const calor = 0.5 + 0.5 * ruido(u + 40, v - 17, semente + 21) + (y / linhas - 0.5) * 0.5;
      const umido = 0.5 + 0.5 * ruido(u - 23, v + 51, semente + 33);
      const veio = Math.abs(ruido(u * 1.7 + 9, v * 1.7 + 3, semente + 47));
      let c;
      if (h < 0.34) c = calor < 0.26 ? "gelo" : "fundo";
      else if (h < 0.44) c = calor < 0.26 ? "gelo" : "mar";
      else if (h < 0.47) c = calor < 0.3 ? "neve" : "areia";
      else if (veio < 0.035 && h < 0.66) c = "rio";
      else if (h > 0.8) c = calor < 0.55 ? "neve" : "pedra";
      else if (h > 0.7) c = "pedra";
      else if (calor < 0.3) c = "neve";
      else if (calor > 0.72 && umido < 0.42) c = "deserto";
      else if (calor > 0.66 && umido < 0.56) c = "savana";
      else if (calor > 0.6 && umido > 0.66) c = "selva";
      else if (umido > 0.7 && h < 0.54) c = "pantano";
      else if (umido > 0.5) c = "floresta";
      else c = "campo";
      classe[i] = NOMES.indexOf(c);
      // o sombreado do mapa do jogo: mais claro se o terreno sobe para o norte, mais escuro se desce
      const norte = y ? alto[i - colunas] : h;
      tom[i] = h - norte > 0.004 ? 2 : h - norte < -0.004 ? 0 : 1;
    }
  }
  return { colunas, linhas, classe, tom, alto };
}

function celula(dados, largura, i, rgb, alfa = 255) {
  dados[i * 4] = rgb[0]; dados[i * 4 + 1] = rgb[1]; dados[i * 4 + 2] = rgb[2]; dados[i * 4 + 3] = alfa;
}

/* Pinta o mapa inteiro numa imagem de uma célula por pixel; o CSS amplia sem suavizar. */
function pintar(ctx, mapa, opcoes = {}) {
  const { revelado = null, aceso = null, dimensao = null, semente = 1 } = opcoes;
  const imagem = ctx.createImageData(mapa.colunas, mapa.linhas);
  const dim = dimensao ? DIMENSOES[dimensao].map(hex) : null;
  for (let i = 0; i < mapa.classe.length; i++) {
    if (revelado && !revelado[i]) { celula(imagem.data, mapa.colunas, i, PAPEL, 0); continue; }
    if (dim) {
      const x = i % mapa.colunas, y = (i / mapa.colunas) | 0;
      const r = 0.5 + 0.5 * ruido(x * 0.16, y * 0.16, semente + 70), fino = 0.5 + 0.5 * ruido(x * 0.7, y * 0.7, semente + 80);
      let cor;
      if (dimensao === "fim") cor = r > 0.62 ? (fino > 0.5 ? dim[3] : dim[2]) : fino > 0.93 ? dim[4] : (fino > 0.5 ? dim[1] : dim[0]);
      else cor = fino > 0.9 ? dim[4] : dim[Math.min(3, Math.floor(r * 4))];
      celula(imagem.data, mapa.colunas, i, cor);
      continue;
    }
    const terreno = TERRENOS[NOMES[mapa.classe[i]]];
    const cor = terreno.rgb[mapa.tom[i]];
    if (aceso && terreno.ambiente !== aceso) {
      // fora do ambiente da vez: o terreno recua para um tom de pergaminho escuro
      const cinza = (cor[0] + cor[1] + cor[2]) / 3;
      celula(imagem.data, mapa.colunas, i, [58 + cinza * 0.1, 52 + cinza * 0.1, 44 + cinza * 0.1]);
    } else celula(imagem.data, mapa.colunas, i, cor);
  }
  ctx.putImageData(imagem, 0, 0);
}

function medir(canvas, celulaPx) {
  const caixa = canvas.getBoundingClientRect();
  const colunas = Math.max(24, Math.ceil(caixa.width / celulaPx)), linhas = Math.max(16, Math.ceil(caixa.height / celulaPx));
  canvas.width = colunas; canvas.height = linhas;
  return { colunas, linhas, caixa };
}

/* ---------- abertura: o mapa se revela em volta do marcador ---------- */

function explorar() {
  const canvas = document.querySelector('[data-mapa="explorar"]');
  if (!canvas) return;
  const secao = canvas.closest("section"), marcador = secao.querySelector(".cb-marcador");
  const ctx = canvas.getContext("2d");
  let mapa, revelado, larguraCelula, alturaCelula;
  const pos = { x: 0.62, y: 0.42 }, alvo = { x: 0.62, y: 0.42 };
  let comPonteiro = false, rumo = Math.random() * 6.28, visivel = true;

  function montar() {
    const m = medir(canvas, innerWidth < 700 ? 9 : 11);
    mapa = gerar(m.colunas, m.linhas, 7);
    revelado = new Uint8Array(m.colunas * m.linhas);
    larguraCelula = m.caixa.width / m.colunas; alturaCelula = m.caixa.height / m.linhas;
    if (PARADO) { revelado.fill(1); pintar(ctx, mapa); marcador.hidden = true; }
  }

  /* revela um círculo de células em volta do marcador, com a borda picotada */
  function revelar(raio) {
    const cx = pos.x * mapa.colunas, cy = pos.y * mapa.linhas;
    let mudou = false;
    for (let y = Math.max(0, Math.floor(cy - raio)); y <= Math.min(mapa.linhas - 1, cy + raio); y++) {
      for (let x = Math.max(0, Math.floor(cx - raio)); x <= Math.min(mapa.colunas - 1, cx + raio); x++) {
        const i = y * mapa.colunas + x;
        if (revelado[i]) continue;
        const d = Math.hypot(x - cx, y - cy) / raio;
        if (d < 0.72 || (d < 1 && ruido(x * 0.9, y * 0.9, 3) > d * 2.4 - 1.9)) { revelado[i] = 1; mudou = true; }
      }
    }
    return mudou;
  }

  function quadro() {
    if (!visivel) return;
    if (!comPonteiro) {
      // sem ponteiro, o marcador passeia sozinho e vira ao chegar perto da borda
      rumo += (Math.random() - 0.5) * 0.3;
      alvo.x += Math.cos(rumo) * 0.006; alvo.y += Math.sin(rumo) * 0.008;
      if (alvo.x < 0.08 || alvo.x > 0.92 || alvo.y < 0.14 || alvo.y > 0.9) rumo += Math.PI * 0.6;
      alvo.x = Math.min(0.95, Math.max(0.05, alvo.x)); alvo.y = Math.min(0.92, Math.max(0.1, alvo.y));
    }
    const dx = alvo.x - pos.x, dy = alvo.y - pos.y;
    pos.x += dx * 0.12; pos.y += dy * 0.12;
    if (revelar(Math.max(9, mapa.colunas * 0.085))) pintar(ctx, mapa, { revelado });
    const giro = Math.abs(dx) + Math.abs(dy) > 0.0005 ? Math.atan2(dy * mapa.linhas, dx * mapa.colunas) : rumo;
    marcador.style.transform = `translate(${(pos.x * mapa.colunas * larguraCelula).toFixed(1)}px, ${(pos.y * mapa.linhas * alturaCelula).toFixed(1)}px) rotate(${(giro + Math.PI / 2).toFixed(2)}rad)`;
    requestAnimationFrame(quadro);
  }

  montar();
  if (PARADO) { addEventListener("resize", montar); return; }
  addEventListener("resize", montar);
  secao.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const caixa = canvas.getBoundingClientRect();
    comPonteiro = true;
    alvo.x = (e.clientX - caixa.left) / caixa.width; alvo.y = (e.clientY - caixa.top) / caixa.height;
  });
  secao.addEventListener("pointerleave", () => { comPonteiro = false; });
  new IntersectionObserver(([e]) => { const antes = visivel; visivel = e.isIntersecting; if (visivel && !antes) requestAnimationFrame(quadro); }).observe(secao);
  requestAnimationFrame(quadro);
}

/* ---------- cena dos ambientes: a rolagem escolhe qual fica aceso ---------- */

function ambientes() {
  const canvas = document.querySelector('[data-mapa="ambientes"]');
  if (!canvas) return;
  const secao = canvas.closest("[data-cena]");
  const passos = [...secao.querySelectorAll("[data-ambiente]")];
  const ctx = canvas.getContext("2d");
  let mapa, atual = null;
  const montar = () => { const m = medir(canvas, innerWidth < 700 ? 8 : 10); mapa = gerar(m.colunas, m.linhas, 19); atual = null; };

  function mostrar(indice) {
    const id = passos[indice].dataset.ambiente;
    if (id === atual) return;
    atual = id;
    secao.dataset.passo = String(indice + 1);
    passos.forEach((p, k) => p.classList.toggle("ativo", k === indice));
    pintar(ctx, mapa, id in DIMENSOES ? { dimensao: id, semente: 19 } : { aceso: id });
  }

  montar();
  if (PARADO) { pintar(ctx, mapa); return; }
  let pedido = false;
  function medirRolagem() {
    pedido = false;
    const sobra = secao.offsetHeight - innerHeight;
    if (sobra <= 0) return;
    const avanco = Math.min(0.9999, Math.max(0, -secao.getBoundingClientRect().top / sobra));
    mostrar(Math.floor(avanco * passos.length));
  }
  const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(medirRolagem); } };
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", () => { montar(); pedir(); });
  medirRolagem();
}

explorar();
ambientes();
