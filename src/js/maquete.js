/* A maquete que gira. Cada <figure data-maquete="/maquetes/nome.json"> mostra uma imagem parada;
 * quando alguém pede (botão, ponteiro parado em cima ou, nas páginas que marcam data-maquete-auto,
 * ao entrar na tela), os blocos são baixados e desenhados em WebGL no lugar da imagem.
 * Arrastar gira; as setas do teclado também. Só uma maquete fica viva por vez. */
import { malhaDaMaquete } from "./maquete-malha.js";

const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
const VERTICE = "attribute vec3 p; attribute vec4 c; uniform mat4 m; varying vec4 v; void main() { v = c; gl_Position = m * vec4(p, 1.0); }";
const FRAGMENTO = "precision mediump float; varying vec4 v; void main() { gl_FragColor = vec4(v.rgb * v.a, v.a); }";
const GUINADA = -38 * Math.PI / 180, INCLINA = 27 * Math.PI / 180;      // o mesmo ângulo da imagem parada
let viva = null;

function ligar(figura, modelo) {
  const tela = document.createElement("canvas");
  const gl = tela.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) return null;
  const malha = malhaDaMaquete(modelo), [W, H, D] = modelo.t;
  // cada face vira dois triângulos
  const pos = new Float32Array(malha.n * 18), cor = new Uint8Array(malha.n * 24);
  for (let f = 0; f < malha.n; f++) {
    [0, 1, 2, 0, 2, 3].forEach((canto, k) => {
      for (let e = 0; e < 3; e++) pos[f * 18 + k * 3 + e] = malha.pos[(f * 4 + canto) * 3 + e];
      for (let e = 0; e < 4; e++) cor[f * 24 + k * 4 + e] = malha.cor[f * 4 + e];
    });
  }
  const programa = gl.createProgram();
  for (const [tipo, fonte] of [[gl.VERTEX_SHADER, VERTICE], [gl.FRAGMENT_SHADER, FRAGMENTO]]) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    gl.attachShader(programa, s);
  }
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return null;
  gl.useProgram(programa);
  const atributo = (nome, dados, tamanho, tipo, normalizar) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
    const onde = gl.getAttribLocation(programa, nome);
    gl.enableVertexAttribArray(onde);
    gl.vertexAttribPointer(onde, tamanho, tipo, normalizar, 0, 0);
  };
  atributo("p", pos, 3, gl.FLOAT, false);
  atributo("c", cor, 4, gl.UNSIGNED_BYTE, true);
  const matriz = gl.getUniformLocation(programa, "m");
  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const raio = Math.hypot(W, H, D) / 2;
  let guinada = GUINADA, inclina = INCLINA, sozinha = !calmo, quadro = 0, antes = 0, visivel = true;

  function desenhar() {
    const lado = Math.round(tela.clientWidth * Math.min(devicePixelRatio || 1, 2)) || 480;
    if (tela.width !== lado) tela.width = tela.height = lado;
    gl.viewport(0, 0, lado, lado);
    const cg = Math.cos(guinada), sg = Math.sin(guinada), ci = Math.cos(inclina), si = Math.sin(inclina);
    const s = 0.97 / raio, k = 0.9 / raio, X = [cg, 0, sg], Y = [sg * si, ci, -cg * si], Z = [-sg * ci, si, cg * ci];
    const centro = [W / 2, H / 2, D / 2], t = (v) => -(v[0] * centro[0] + v[1] * centro[1] + v[2] * centro[2]);
    gl.uniformMatrix4fv(matriz, false, new Float32Array([
      s * X[0], s * Y[0], -k * Z[0], 0, s * X[1], s * Y[1], -k * Z[1], 0, s * X[2], s * Y[2], -k * Z[2], 0, s * t(X), s * t(Y), -k * t(Z), 1
    ]));
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.drawArrays(gl.TRIANGLES, 0, malha.vidro * 6);
    if (malha.n > malha.vidro) {                     // água, vidro e gelo por último, deixando ver o que está atrás
      gl.enable(gl.BLEND);
      gl.depthMask(false);
      gl.drawArrays(gl.TRIANGLES, malha.vidro * 6, (malha.n - malha.vidro) * 6);
    }
  }
  function passo(agora) {
    quadro = 0;
    if (sozinha && visivel) {
      guinada += Math.min(0.05, (agora - (antes || agora)) / 1000) * 0.32;
      antes = agora;
      quadro = requestAnimationFrame(passo);
    }
    desenhar();
  }
  const pedir = () => { if (!quadro) quadro = requestAnimationFrame(passo); };

  let arrasto = null;
  tela.addEventListener("pointerdown", (e) => {
    arrasto = { x: e.clientX, y: e.clientY };
    sozinha = false;
    tela.setPointerCapture(e.pointerId);
    figura.classList.add("girando");
  });
  tela.addEventListener("pointermove", (e) => {
    if (!arrasto) return;
    guinada += (e.clientX - arrasto.x) * 0.011;
    inclina = Math.min(1.45, Math.max(0.04, inclina + (e.clientY - arrasto.y) * 0.008));
    arrasto = { x: e.clientX, y: e.clientY };
    pedir();
  });
  const soltar = () => { arrasto = null; figura.classList.remove("girando"); };
  tela.addEventListener("pointerup", soltar);
  tela.addEventListener("pointercancel", soltar);
  tela.addEventListener("keydown", (e) => {
    const passos = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] }[e.key];
    if (!passos) return;
    e.preventDefault();
    sozinha = false;
    guinada += passos[0];
    inclina = Math.min(1.45, Math.max(0.04, inclina + passos[1]));
    pedir();
  });
  const olho = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => { visivel = e.isIntersecting; antes = 0; if (visivel) pedir(); }) : null;
  olho?.observe(tela);
  addEventListener("resize", pedir);

  tela.className = "maquete-tela";
  tela.tabIndex = 0;
  tela.setAttribute("role", "img");
  tela.setAttribute("aria-label", `${figura.querySelector("img")?.alt || "Maquete"}. Arraste ou use as setas para girar.`);
  figura.append(tela);
  figura.classList.add("viva");
  pedir();
  return () => {
    cancelAnimationFrame(quadro);
    olho?.disconnect();
    removeEventListener("resize", pedir);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    tela.remove();
    figura.classList.remove("viva", "girando");
  };
}

const modelos = new Map();
async function acordar(figura, focar = false) {
  if (viva?.figura === figura || figura.dataset.estado === "falhou") return;
  figura.dataset.estado = "carregando";
  try {
    const endereco = figura.dataset.maquete;
    if (!modelos.has(endereco)) modelos.set(endereco, fetch(endereco).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))));
    const modelo = await modelos.get(endereco);
    if (viva?.figura === figura) return;
    viva?.desligar();
    viva = null;
    const desligar = ligar(figura, modelo);
    if (!desligar) throw new Error("sem WebGL");
    viva = { figura, desligar };
    figura.dataset.estado = "viva";
    if (focar) figura.querySelector(".maquete-tela")?.focus({ preventScroll: true });
  } catch {
    figura.dataset.estado = "falhou";               // sem WebGL ou sem rede, a imagem parada continua valendo
  }
}

const figuras = [...document.querySelectorAll("[data-maquete]")];
for (const figura of figuras) {
  figura.querySelector(".maquete-girar")?.addEventListener("click", () => acordar(figura, true));
  let espera = 0;
  figura.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") espera = setTimeout(() => acordar(figura), 180); });
  figura.addEventListener("pointerleave", () => clearTimeout(espera));
}
/* nas páginas de leitura corrida (biomas), a maquete que está no meio da tela acorda sozinha */
const automaticas = figuras.filter((f) => "maqueteAuto" in f.dataset);
if (automaticas.length && "IntersectionObserver" in window) {
  const meio = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) acordar(e.target);
  }, { rootMargin: "-35% 0px -35% 0px" });
  for (const f of automaticas) meio.observe(f);
}
