/* A maquete que gira. Cada <figure data-maquete="/maquetes/nome.json"> mostra uma imagem parada;
 * quando alguém pede (um clique no botão ou na própria imagem; nas páginas que marcam
 * data-maquete-auto, ao entrar na tela), os blocos são baixados e desenhados em WebGL no lugar da imagem.
 * Arrastar gira; as setas do teclado também. Para aproximar: a roda do mouse (depois de clicar na
 * maquete, para a página continuar rolando normalmente), os botões + e −, a pinça no toque ou as teclas
 * + e −. Com Shift, ou com o botão direito, o arrasto desloca. Dois cliques voltam ao começo.
 * Só uma maquete fica viva por vez.
 * Funciona com ou sem WebGL: ver os dois desenhistas, abaixo. */
import { malhaDaMaquete } from "./maquete-malha.js";

const calmo = matchMedia("(prefers-reduced-motion: reduce)").matches;
const VERTICE = "attribute vec3 p; attribute vec4 c; uniform mat4 m; varying vec4 v; void main() { v = c; gl_Position = m * vec4(p, 1.0); }";
const FRAGMENTO = "precision mediump float; varying vec4 v; void main() { gl_FragColor = vec4(v.rgb * v.a, v.a); }";
const GUINADA = -38 * Math.PI / 180, INCLINA = 27 * Math.PI / 180;      // o mesmo ângulo da imagem parada
let viva = null;

/* Dois desenhistas para a mesma malha. O de WebGL é o preferido; onde o navegador não entrega WebGL
 * (aceleração de vídeo desligada ou placa bloqueada, comum no Chrome em Linux), entra o de software,
 * que pinta os blocos ponto a ponto num canvas comum. Cada um devolve { desenhar(guinada, inclina), soltar() }. */

function desenhistaWebgl(tela, malha, [W, H, D]) {
  const gl = tela.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) return null;
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
  return {
    desenhar(guinada, inclina, zoom, dx, dy) {
      const lado = Math.round(tela.clientWidth * Math.min(devicePixelRatio || 1, 2)) || 480;
      if (tela.width !== lado) tela.width = tela.height = lado;
      gl.viewport(0, 0, lado, lado);
      const cg = Math.cos(guinada), sg = Math.sin(guinada), ci = Math.cos(inclina), si = Math.sin(inclina);
      const s = (0.97 / raio) * zoom, k = 0.9 / raio, X = [cg, 0, sg], Y = [sg * si, ci, -cg * si], Z = [-sg * ci, si, cg * ci];
      const centro = [W / 2, H / 2, D / 2], t = (v) => -(v[0] * centro[0] + v[1] * centro[1] + v[2] * centro[2]);
      gl.uniformMatrix4fv(matriz, false, new Float32Array([
        s * X[0], s * Y[0], -k * Z[0], 0, s * X[1], s * Y[1], -k * Z[1], 0, s * X[2], s * Y[2], -k * Z[2], 0, s * t(X) + dx, s * t(Y) + dy, -k * t(Z), 1
      ]));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND);
      gl.depthMask(true);
      gl.drawArrays(gl.TRIANGLES, 0, malha.vidro * 6);
      if (malha.n > malha.vidro) {                   // água, vidro e gelo por último, deixando ver o que está atrás
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        gl.drawArrays(gl.TRIANGLES, malha.vidro * 6, (malha.n - malha.vidro) * 6);
      }
    },
    soltar() { gl.getExtension("WEBGL_lose_context")?.loseContext(); }
  };
}

function desenhistaDeSoftware(tela, malha, [W, H, D]) {
  const ctx = tela.getContext("2d");
  if (!ctx) return null;
  const raio = Math.hypot(W, H, D) / 2, pontos = new Float32Array(malha.n * 12);
  let lado = 0, imagem = null, fundo = null;
  return {
    desenhar(guinada, inclina, zoom, dx, dy) {
      const L = Math.min(document.fullscreenElement ? 1000 : 680, Math.round(tela.clientWidth * Math.min(devicePixelRatio || 1, 1.5)) || 480);
      if (L !== lado) { lado = tela.width = tela.height = L; imagem = ctx.createImageData(L, L); fundo = new Float32Array(L * L); }
      const d = imagem.data;
      d.fill(0);
      fundo.fill(-Infinity);
      const cg = Math.cos(guinada), sg = Math.sin(guinada), ci = Math.cos(inclina), si = Math.sin(inclina), escala = (0.97 / raio) * (L / 2) * zoom, meio = L / 2;
      for (let i = 0; i < malha.n * 4; i++) {
        const a = malha.pos[i * 3] - W / 2, b = malha.pos[i * 3 + 1] - H / 2, c = malha.pos[i * 3 + 2] - D / 2, z1 = -a * sg + c * cg;
        pontos[i * 3] = meio + (a * cg + c * sg) * escala + dx * meio;
        pontos[i * 3 + 1] = meio - (b * ci - z1 * si) * escala - dy * meio;
        pontos[i * 3 + 2] = b * si + z1 * ci;        // maior = mais perto de quem olha
      }
      for (let f = 0; f < malha.n; f++) {
        // sem perspectiva, cada face é um paralelogramo: um canto e dois lados bastam
        const o = f * 12, ax = pontos[o], ay = pontos[o + 1], az = pontos[o + 2];
        const ux = pontos[o + 3] - ax, uy = pontos[o + 4] - ay, uz = pontos[o + 5] - az, vx = pontos[o + 9] - ax, vy = pontos[o + 10] - ay, vz = pontos[o + 11] - az;
        const det = ux * vy - uy * vx;
        if (Math.abs(det) < 1e-6) continue;          // face de perfil
        const x0 = Math.max(0, Math.floor(Math.min(ax, ax + ux, ax + vx, ax + ux + vx))), x1 = Math.min(L - 1, Math.ceil(Math.max(ax, ax + ux, ax + vx, ax + ux + vx)));
        const y0 = Math.max(0, Math.floor(Math.min(ay, ay + uy, ay + vy, ay + uy + vy))), y1 = Math.min(L - 1, Math.ceil(Math.max(ay, ay + uy, ay + vy, ay + uy + vy)));
        const r = malha.cor[f * 4], g = malha.cor[f * 4 + 1], b = malha.cor[f * 4 + 2], alfa = malha.cor[f * 4 + 3] / 255, vidro = f >= malha.vidro;
        for (let y = y0; y <= y1; y++) {
          const py = y + 0.5 - ay;
          for (let x = x0; x <= x1; x++) {
            const px = x + 0.5 - ax, s = (px * vy - py * vx) / det, t = (py * ux - px * uy) / det;
            if (s < -0.02 || s > 1.02 || t < -0.02 || t > 1.02) continue;
            const z = az + s * uz + t * vz, i = y * L + x;
            if (vidro) {
              if (z < fundo[i] - 1e-4) continue;
              const tras = (d[i * 4 + 3] / 255) * (1 - alfa), soma = alfa + tras;
              d[i * 4] = (r * alfa + d[i * 4] * tras) / soma; d[i * 4 + 1] = (g * alfa + d[i * 4 + 1] * tras) / soma; d[i * 4 + 2] = (b * alfa + d[i * 4 + 2] * tras) / soma; d[i * 4 + 3] = soma * 255;
            } else if (z > fundo[i]) {
              fundo[i] = z;
              d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
            }
          }
        }
      }
      ctx.putImageData(imagem, 0, 0);
    },
    soltar() {}
  };
}

function ligar(figura, modelo, semWebgl = false) {
  const malha = malhaDaMaquete(modelo);
  let tela = document.createElement("canvas"), fechada = false;
  let desenhista = semWebgl ? null : desenhistaWebgl(tela, malha, modelo.t);
  if (!desenhista) { tela = document.createElement("canvas"); desenhista = desenhistaDeSoftware(tela, malha, modelo.t); }
  if (!desenhista) return null;
  let guinada = GUINADA, inclina = INCLINA, sozinha = !calmo, quadro = 0, antes = 0, visivel = true;
  let zoom = 1, dx = 0, dy = 0;                       // dx e dy em metades de tela: 1 leva o centro até a borda

  function passo(agora) {
    quadro = 0;
    if (sozinha && visivel) {
      guinada += Math.min(0.05, (agora - (antes || agora)) / 1000) * 0.32;
      antes = agora;
      quadro = requestAnimationFrame(passo);
    }
    const inicio = performance.now();
    desenhista.desenhar(guinada, inclina, zoom, dx, dy);
    if (performance.now() - inicio > 70) sozinha = false;       // maquete pesada demais para girar sozinha: fica só o arrasto
  }
  const pedir = () => { if (!quadro) quadro = requestAnimationFrame(passo); };

  /* aproxima ou afasta mantendo parado o ponto (cx, cy) da tela, de -1 a 1 */
  const aproximar = (fator, cx = 0, cy = 0) => {
    const novo = Math.min(16, Math.max(1, zoom * fator)), f = novo / zoom;
    dx = cx - (cx - dx) * f;
    dy = cy - (cy - dy) * f;
    zoom = novo;
    if (zoom === 1) dx = dy = 0;
    sozinha = false;
    pedir();
  };
  const voltar = () => { zoom = 1; dx = dy = 0; guinada = GUINADA; inclina = INCLINA; pedir(); };
  const naTela = (x, y) => { const r = tela.getBoundingClientRect(); return [((x - r.left) / r.width) * 2 - 1, 1 - ((y - r.top) / r.height) * 2]; };
  const deslocar = (px, py) => { const r = tela.getBoundingClientRect(); dx += (px / r.width) * 2; dy -= (py / r.height) * 2; };

  const dedos = new Map();
  tela.addEventListener("pointerdown", (e) => {
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY });
    sozinha = false;
    tela.setPointerCapture(e.pointerId);
    tela.focus({ preventScroll: true });
    figura.classList.add("girando");
  });
  tela.addEventListener("pointermove", (e) => {
    const antes = dedos.get(e.pointerId);
    if (!antes) return;
    const agora = { x: e.clientX, y: e.clientY };
    if (dedos.size === 1) {
      if (e.shiftKey || e.buttons === 2 || e.buttons === 4) deslocar(agora.x - antes.x, agora.y - antes.y);
      else {
        guinada += (agora.x - antes.x) * 0.011;
        inclina = Math.min(1.45, Math.max(0.04, inclina + (agora.y - antes.y) * 0.008));
      }
    } else {                                         // dois dedos: a distância entre eles aproxima, o meio deles desloca
      const outro = [...dedos].find(([id]) => id !== e.pointerId)[1];
      const d0 = Math.hypot(antes.x - outro.x, antes.y - outro.y), d1 = Math.hypot(agora.x - outro.x, agora.y - outro.y);
      if (d0 > 4) aproximar(d1 / d0, ...naTela((agora.x + outro.x) / 2, (agora.y + outro.y) / 2));
      deslocar((agora.x - antes.x) / 2, (agora.y - antes.y) / 2);
    }
    dedos.set(e.pointerId, agora);
    pedir();
  });
  const soltar = (e) => { dedos.delete(e.pointerId); if (!dedos.size) figura.classList.remove("girando"); };
  tela.addEventListener("pointerup", soltar);
  tela.addEventListener("pointercancel", soltar);
  tela.addEventListener("pointerleave", () => { if (!dedos.size) tela.blur(); });
  tela.addEventListener("contextmenu", (e) => e.preventDefault());
  tela.addEventListener("dblclick", voltar);
  // a roda só aproxima depois de um clique na maquete (ou com Ctrl); fora disso, a página rola como sempre
  tela.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && document.activeElement !== tela) return;
    e.preventDefault();
    aproximar(Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0022)), ...naTela(e.clientX, e.clientY));
  }, { passive: false });
  tela.addEventListener("keydown", (e) => {
    if (e.key === "+" || e.key === "=") { e.preventDefault(); return aproximar(1.3); }
    if (e.key === "-" || e.key === "_") { e.preventDefault(); return aproximar(1 / 1.3); }
    if (e.key === "0") { e.preventDefault(); return voltar(); }
    const passos = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] }[e.key];
    if (!passos) return;
    e.preventDefault();
    sozinha = false;
    guinada += passos[0];
    inclina = Math.min(1.45, Math.max(0.04, inclina + passos[1]));
    pedir();
  });
  /* os botões: aproximar, afastar e tela cheia */
  const barra = document.createElement("div");
  barra.className = "maquete-barra";
  barra.innerHTML = `<button type="button" data-zoom="1.5" aria-label="Aproximar">+</button><button type="button" data-zoom="0.667" aria-label="Afastar">−</button>${figura.requestFullscreen ? '<button type="button" data-cheia>Tela cheia</button>' : ""}`;
  barra.addEventListener("click", (e) => {
    const botao = e.target.closest("button");
    if (!botao) return;
    if (botao.dataset.zoom) aproximar(Number(botao.dataset.zoom));
    else if (document.fullscreenElement === figura) document.exitFullscreen();
    else figura.requestFullscreen().catch(() => {});
  });
  const aoMudarDeTela = () => {
    const cheia = document.fullscreenElement === figura, botao = barra.querySelector("[data-cheia]");
    if (botao) botao.textContent = cheia ? "Sair da tela cheia" : "Tela cheia";
    requestAnimationFrame(pedir);
  };
  figura.addEventListener("fullscreenchange", aoMudarDeTela);
  figura.append(barra);
  const olho = "IntersectionObserver" in window ? new IntersectionObserver(([e]) => { visivel = e.isIntersecting; antes = 0; if (visivel) pedir(); }) : null;
  olho?.observe(tela);
  addEventListener("resize", pedir);

  tela.className = "maquete-tela";
  tela.tabIndex = 0;
  tela.setAttribute("role", "img");
  tela.setAttribute("aria-label", `${figura.querySelector("img")?.alt || "Maquete"}. Arraste ou use as setas para girar; + e − aproximam.`);
  figura.append(tela);
  figura.classList.add("viva");
  pedir();
  const fechar = () => {
    fechada = true;
    cancelAnimationFrame(quadro);
    olho?.disconnect();
    removeEventListener("resize", pedir);
    desenhista.soltar();
    figura.removeEventListener("fullscreenchange", aoMudarDeTela);
    if (document.fullscreenElement === figura) document.exitFullscreen();
    barra.remove();
    tela.remove();
    figura.classList.remove("viva", "girando");
  };
  // se o navegador tirar o WebGL no meio do caminho, a maquete continua no desenhista de software
  tela.addEventListener("webglcontextlost", () => {
    if (fechada || viva?.figura !== figura) return;
    fechar();
    const desligar = ligar(figura, modelo, true);
    viva = desligar ? { figura, desligar } : null;
    if (!desligar) figura.dataset.estado = "falhou";
  });
  return fechar;
}

const modelos = new Map();
async function acordar(figura, focar = false) {
  if (viva?.figura === figura || figura.dataset.estado === "falhou" || figura.dataset.estado === "carregando") return;
  const botao = figura.querySelector(".maquete-girar"), dica = figura.querySelector(".maquete-dica");
  figura.dataset.estado = "carregando";
  if (botao) { botao.dataset.texto ??= botao.textContent; botao.textContent = "Carregando…"; }
  try {
    const endereco = figura.dataset.maquete;
    if (!modelos.has(endereco)) modelos.set(endereco, fetch(endereco).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))));
    const modelo = await modelos.get(endereco);
    if (viva?.figura === figura) return;
    if (viva) { viva.desligar(); viva.figura.dataset.estado = "parada"; }
    viva = null;
    const desligar = ligar(figura, modelo);
    if (!desligar) throw new Error("sem canvas");
    viva = { figura, desligar };
    figura.dataset.estado = "viva";
    if (focar) figura.querySelector(".maquete-tela")?.focus({ preventScroll: true });
  } catch (erro) {
    figura.dataset.estado = "falhou";               // a imagem parada continua valendo, e a página diz o que houve
    modelos.delete(figura.dataset.maquete);
    if (dica) dica.textContent = erro?.message === "sem canvas" ? "Este navegador não desenha o modelo 3D" : "Não deu para baixar a maquete. Recarregue a página";
  } finally {
    if (botao) botao.textContent = botao.dataset.texto;
  }
}

const figuras = [...document.querySelectorAll("[data-maquete]")];
/* O modelo só entra com um clique: no botão ou em qualquer ponto da imagem. (Antes bastava parar o
 * ponteiro em cima, e o botão sumia debaixo da mão de quem ia clicar.) */
for (const figura of figuras) figura.addEventListener("click", (e) => { if (!e.target.closest(".maquete-tela")) acordar(figura, true); });
/* nas páginas de leitura corrida (biomas), a maquete que está no meio da tela acorda sozinha */
const automaticas = figuras.filter((f) => "maqueteAuto" in f.dataset);
if (automaticas.length && "IntersectionObserver" in window) {
  const meio = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) acordar(e.target);
  }, { rootMargin: "-35% 0px -35% 0px" });
  for (const f of automaticas) meio.observe(f);
}
