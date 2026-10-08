/* Desenhe o seu perfil: cada vértice do hexágono é uma alça que se arrasta (ou se move com as setas), e a
 * lista de jogos se reordena na hora pelo quanto cada perfil se parece com o desenhado. O desenho fica no
 * endereço, para mandar a alguém. */
import { EIXOS, alcance, notaDoAlcance, encaixe, NOTA_MAXIMA } from "./hexagono.js";
import { hexVivo, REDUZIDO } from "./hex-vivo.js";
import { JOGOS } from "./dados.js";

const INICIAL = 3, RAIO = 0.44;                      // a nota de partida de todos os eixos; o raio do hexágono dentro da caixa
const raiz = document.querySelector("[data-desenhar]");
const caixa = raiz.querySelector(".hex-vivo"), lista = raiz.querySelector("[data-lista]"), aviso = raiz.querySelector("[data-aviso]");
const alcas = [...caixa.querySelectorAll(".hex-pega")];
const itens = new Map([...lista.children].map((li) => [li.dataset.slug, li]));
const desenho = hexVivo(caixa.querySelector("canvas"), { pulso: false });
caixa.classList.add("vivo");

/* O perfil guardado no endereço: seis notas de 0 a 5, vezes dez, separadas por vírgula. */
function lerEndereco() {
  const m = /^#p=((?:\d{1,2},){5}\d{1,2})$/.exec(location.hash);
  return m ? m[1].split(",").map((v) => Math.min(NOTA_MAXIMA, Number(v) / 10)) : null;
}
let valores = lerEndereco() ?? EIXOS.map(() => INICIAL);

function mostrar(gravar = true) {
  desenho.definir([{ valores }]);
  alcas.forEach((alca, i) => {
    const a = (EIXOS[i].ang * Math.PI) / 180, r = RAIO * 100 * alcance(valores[i]), v = Math.round(valores[i] * 10) / 10;
    alca.style.left = `${(50 + Math.cos(a) * r).toFixed(2)}%`;
    alca.style.top = `${(50 + Math.sin(a) * r).toFixed(2)}%`;
    alca.setAttribute("aria-valuenow", String(v));
    alca.setAttribute("aria-valuetext", `${String(v).replace(".", ",")} de ${NOTA_MAXIMA}`);
  });
  ordenar();
  if (gravar) history.replaceState(null, "", `#p=${valores.map((v) => Math.round(v * 10)).join(",")}`);
}

/* Reordena a lista pela afinidade. Quem muda de lugar desliza até o novo, em vez de pular. */
function ordenar() {
  const ordem = JOGOS.map((j) => ({ j, s: encaixe(valores, j.valores) })).sort((a, b) => b.s - a.s);
  const antes = new Map([...lista.children].map((li) => [li, li.getBoundingClientRect().top]));
  for (const { j, s } of ordem) {
    const li = itens.get(j.slug), afinidade = Math.round(((s + 1) / 2) * 100);
    li.querySelector("[data-barra]").style.width = `${afinidade}%`;
    li.querySelector("[data-valor]").textContent = `${afinidade}%`;
    lista.append(li);
  }
  if (REDUZIDO) return;
  for (const li of lista.children) {
    const de = antes.get(li), para = li.getBoundingClientRect().top;
    if (!li.offsetParent || Math.abs(de - para) < 1) continue;
    li.animate([{ transform: `translateY(${de - para}px)` }, { transform: "none" }], { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
  }
}

/* Arrastar: o ponteiro é projetado na direção do eixo, e a distância ao centro vira nota. */
let quadro = 0;
alcas.forEach((alca, i) => {
  const a = (EIXOS[i].ang * Math.PI) / 180, ux = Math.cos(a), uy = Math.sin(a);
  const mover = (e) => {
    const r = caixa.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const distancia = ((e.clientX - cx) * ux + (e.clientY - cy) * uy) / (r.width * RAIO);
    valores[i] = Math.round(notaDoAlcance(distancia) * 10) / 10;
    if (!quadro) quadro = requestAnimationFrame(() => { quadro = 0; mostrar(); });
  };
  alca.addEventListener("pointerdown", (e) => { alca.setPointerCapture(e.pointerId); alca.classList.add("arrastando"); e.preventDefault(); alca.focus(); });
  alca.addEventListener("pointermove", (e) => { if (alca.hasPointerCapture(e.pointerId)) mover(e); });
  for (const fim of ["pointerup", "pointercancel"]) alca.addEventListener(fim, () => alca.classList.remove("arrastando"));
  alca.addEventListener("keydown", (e) => {
    const passo = { ArrowUp: 0.5, ArrowRight: 0.5, ArrowDown: -0.5, ArrowLeft: -0.5 }[e.key];
    const novo = e.key === "Home" ? 0 : e.key === "End" ? NOTA_MAXIMA : passo ? valores[i] + passo : null;
    if (novo === null) return;
    e.preventDefault();
    valores[i] = Math.min(NOTA_MAXIMA, Math.max(0, Math.round(novo * 2) / 2));
    mostrar();
  });
});

raiz.querySelector("[data-zerar]").addEventListener("click", () => {
  valores = EIXOS.map(() => INICIAL);
  aviso.textContent = "";
  addEventListener("hashchange", () => { const lidos = lerEndereco(); if (lidos) { valores = lidos; mostrar(false); } });
mostrar(false);
  history.replaceState(null, "", location.pathname);
});
raiz.querySelector("[data-copiar]").addEventListener("click", async () => {
  mostrar();
  try { await navigator.clipboard.writeText(location.href); aviso.textContent = "Link copiado."; }
  catch { aviso.textContent = "Não foi possível copiar. O link está na barra de endereço."; }
});
const todos = raiz.querySelector("[data-todos]");
todos.addEventListener("click", () => {
  const abertos = lista.classList.toggle("inteira");
  todos.setAttribute("aria-expanded", String(abertos));
  todos.textContent = abertos ? "Ver só os oito primeiros" : `Ver os ${JOGOS.length} jogos`;
});

mostrar(false);
