/* O Pokémon do Cobblemon em 3D na página da espécie: o botão "Girar em 3D" troca o retrato pelo modelo do
 * mod, com a textura dele, no visor comum (src/js/visor.js). O botão "Shiny" troca a textura pela da variação.
 * Dois desenhistas: WebGL e, onde o navegador não o entrega, o de software (modelo-desenho.js). */
import { facesDoExportado } from "./modelo-malha.js";
import { medidas, rotacao, desenharModelo } from "./modelo-desenho.js";
import { acordar, estaViva } from "./visor.js";

const VERTICE = `attribute vec3 p; attribute vec2 t; attribute vec3 n;
uniform mat3 r; uniform vec3 c; uniform vec4 v; varying vec2 uv; varying float luz;
void main() {
  vec3 q = r * (p - c), nv = normalize(r * n);
  luz = 0.56 + 0.44 * max(0.0, dot(nv, vec3(-0.3434, 0.8438, -0.4121)));
  uv = t;
  gl_Position = nv.z > 0.000001 ? vec4(2.0, 2.0, 2.0, 1.0) : vec4(q.x * v.x + v.z, q.y * v.x + v.w, q.z * v.y, 1.0);
}`;   // a face de costas é jogada para fora da tela: é o que o jogo faz, e é assim que se vê o miolo do Solosis
const FRAGMENTO = `precision mediump float; uniform sampler2D s; uniform float vidro; varying vec2 uv; varying float luz;
void main() {
  vec4 k = texture2D(s, uv);
  if (k.a < 0.06 || (vidro < 0.5 ? k.a < 0.95 : k.a >= 0.95)) discard;
  gl_FragColor = vec4(k.rgb * luz * k.a, k.a);
}`;
const GUINADA = -32 * Math.PI / 180, INCLINA = 14 * Math.PI / 180;      // o mesmo ângulo do retrato parado

function desenhistaWebgl(tela, faces, medida, textura) {
  const gl = tela.getContext("webgl", { antialias: true, alpha: true });
  if (!gl) return null;
  const pos = new Float32Array(faces.length * 18), uv = new Float32Array(faces.length * 12), normal = new Float32Array(faces.length * 18);
  faces.forEach((f, i) => [0, 1, 2, 0, 2, 3].forEach((canto, k) => {
    pos.set(f.pontos[canto], i * 18 + k * 3);
    uv.set(f.uvs[canto], i * 12 + k * 2);
    normal.set(f.normal, i * 18 + k * 3);
  }));
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
  for (const [nome, dados, tamanho] of [["p", pos, 3], ["t", uv, 2], ["n", normal, 3]]) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
    const onde = gl.getAttribLocation(programa, nome);
    gl.enableVertexAttribArray(onde);
    gl.vertexAttribPointer(onde, tamanho, gl.FLOAT, false, 0, 0);
  }
  const u = (nome) => gl.getUniformLocation(programa, nome);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  const carregar = (imagem) => {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagem);
    for (const [k, valor] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, valor);
  };
  carregar(textura.imagem);
  gl.uniform3fv(u("c"), medida.centro);
  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  return {
    desenhar(guinada, inclina, zoom, dx, dy) {
      const lado = Math.round(tela.clientWidth * Math.min(devicePixelRatio || 1, 2)) || 480;
      if (tela.width !== lado) tela.width = tela.height = lado;
      gl.viewport(0, 0, lado, lado);
      const [X, Y, Z] = rotacao(guinada, inclina);
      gl.uniformMatrix3fv(u("r"), false, new Float32Array([X[0], Y[0], Z[0], X[1], Y[1], Z[1], X[2], Y[2], Z[2]]));
      gl.uniform4f(u("v"), (0.95 / medida.raio) * zoom, 0.9 / medida.raio, dx, dy);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.BLEND); gl.depthMask(true); gl.uniform1f(u("vidro"), 0);
      gl.drawArrays(gl.TRIANGLES, 0, faces.length * 6);
      gl.enable(gl.BLEND); gl.depthMask(false); gl.uniform1f(u("vidro"), 1);       // o que é translúcido por último, deixando ver o que está atrás
      gl.drawArrays(gl.TRIANGLES, 0, faces.length * 6);
    },
    trocar: (nova) => carregar(nova.imagem),
    soltar() { gl.getExtension("WEBGL_lose_context")?.loseContext(); }
  };
}

function desenhistaDeSoftware(tela, faces, medida, textura) {
  const ctx = tela.getContext("2d");
  if (!ctx) return null;
  let lado = 0, imagem = null, atual = textura;
  return {
    desenhar(guinada, inclina, zoom, dx, dy) {
      const L = Math.min(document.fullscreenElement ? 900 : 620, Math.round(tela.clientWidth * Math.min(devicePixelRatio || 1, 1.5)) || 480);
      if (L !== lado) { lado = tela.width = tela.height = L; imagem = ctx.createImageData(L, L); }
      imagem.data.fill(0);
      desenharModelo(imagem.data, L, faces, atual.pontos(), medida, guinada, inclina, zoom, dx, dy);
      ctx.putImageData(imagem, 0, 0);
    },
    trocar: (nova) => { atual = nova; },
    soltar() {}
  };
}

/* Uma textura baixada: a imagem (para o WebGL) e os pontos dela (para o desenhista de software), lidos só se preciso. */
function textura(endereco) {
  return new Promise((certo, erro) => {
    const imagem = new Image();
    let pontos = null;
    imagem.onload = () => certo({ imagem, pontos() {
      if (!pontos) { const c = Object.assign(document.createElement("canvas"), { width: imagem.naturalWidth, height: imagem.naturalHeight }), x = c.getContext("2d"); x.drawImage(imagem, 0, 0); pontos = x.getImageData(0, 0, c.width, c.height); }
      return pontos;
    } });
    imagem.onerror = () => erro(new Error("textura"));
    imagem.src = endereco;
  });
}

const figura = document.querySelector("[data-modelo3d]");
if (figura) {
  const botaoShiny = figura.querySelector("[data-shiny-botao]");
  let shiny = false, desenhista = null, pedir = null, atual = null;       // atual: a textura em uso, para o desenhista que entrar depois
  const enderecoDaTextura = () => (shiny ? figura.dataset.shiny : figura.dataset.textura);
  const ligar = async (focar) => {
    const desligar = await acordar(figura, async () => {
      const [modelo, tex] = await Promise.all([fetch(figura.dataset.modelo3d).then((r) => (r.ok ? r.json() : Promise.reject(new Error(r.status)))), textura(enderecoDaTextura())]);
      const faces = facesDoExportado(modelo), medida = medidas(faces);
      atual = tex;
      return {
        fabricar: (tela, semWebgl) => (desenhista = semWebgl ? desenhistaDeSoftware(tela, faces, medida, atual) : desenhistaWebgl(tela, faces, medida, atual)),
        opcoes: { guinada: GUINADA, inclina: INCLINA, inclinaMin: -0.7, inclinaMax: 1.3, sentido: -1 }
      };
    }, focar);
    pedir = desligar?.pedir ?? null;
    return Boolean(desligar);
  };
  figura.querySelector(".maquete-girar")?.addEventListener("click", (e) => { e.stopPropagation(); ligar(true); });
  botaoShiny?.addEventListener("click", async (e) => {
    e.stopPropagation();
    shiny = !shiny;
    botaoShiny.setAttribute("aria-pressed", String(shiny));
    figura.classList.toggle("shiny", shiny);
    if (!estaViva(figura)) { await ligar(false); return; }          // ligar já baixa a textura certa
    try { atual = await textura(enderecoDaTextura()); desenhista?.trocar(atual); pedir?.(); } catch { /* sem a textura nova, fica a que estava */ }
  });
}
