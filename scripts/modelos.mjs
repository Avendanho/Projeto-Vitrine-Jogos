#!/usr/bin/env node
/* Desenha cada Pokémon do Cobblemon a partir do modelo e da textura do próprio
 * mod (gitlab.com/cable-mc/cobblemon, licença MPL 2.0), na pose em que o jogo o
 * mostra no perfil (o primeiro instante da animação parada), e grava em
 * src/arte/modelo/:
 *   <n>.webp        o modelo em cor, visto de três quartos
 *   <n>-tinta.png   o mesmo desenho em quatro tons de tinta de mapa, pequeno, para as listas
 *
 * É um desenhista de software: lê a geometria Bedrock (ossos, cubos, UV), monta
 * a hierarquia, projeta sem perspectiva e pinta com um z-buffer. Não usa GPU.
 *
 * Uso: node scripts/modelos.mjs --fonte <pasta do repositório do Cobblemon> [--previa arquivo.png] [número ...]
 * Os arquivos gerados ficam no repositório; o build não depende deste script.
 */
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opcao = (nome) => { const i = args.indexOf(`--${nome}`); return i >= 0 ? args.splice(i, 2)[1] : null; };
const FONTE = opcao("fonte"), PREVIA = opcao("previa");
if (!FONTE) { console.error("Informe --fonte <pasta do repositório do Cobblemon>."); process.exit(1); }
const ATIVOS = join(FONTE, "common", "src", "main", "resources", "assets", "cobblemon");
const SAIDA = join(RAIZ, "src", "arte", "modelo");

async function arquivos(pasta, sufixo) {
  if (!existsSync(pasta)) return [];
  const lista = [];
  for (const item of await readdir(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, item.name);
    if (item.isDirectory()) lista.push(...await arquivos(caminho, sufixo));
    else if (item.name.endsWith(sufixo)) lista.push(caminho);
  }
  return lista;
}
const json = async (c) => JSON.parse(await readFile(c, "utf8"));

/* ---------- matrizes 4x4, em linha ---------- */

const identidade = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function vezes(a, b) {
  const r = new Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) r[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + a[i * 4 + 3] * b[12 + j];
  return r;
}
const mover = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
function girar([gx, gy, gz]) {                   // ordem ZYX, como no editor em que os modelos são feitos
  const [x, y, z] = [gx, gy, gz].map((g) => (g * Math.PI) / 180);
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  const rx = [1, 0, 0, 0, 0, cx, -sx, 0, 0, sx, cx, 0, 0, 0, 0, 1];
  const ry = [cy, 0, sy, 0, 0, 1, 0, 0, -sy, 0, cy, 0, 0, 0, 0, 1];
  const rz = [cz, -sz, 0, 0, sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return vezes(rz, vezes(ry, rx));
}
/* girar em torno de um ponto */
const emTorno = (pivo, giro) => vezes(mover(...pivo), vezes(girar(giro), mover(-pivo[0], -pivo[1], -pivo[2])));
const aplicar = (m, [x, y, z]) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];

/* ---------- da geometria Bedrock a uma lista de faces ---------- */

/* O formato guarda X ao contrário do espaço em que se desenha: X e as rotações em X e Y trocam de sinal. */
const pivoDe = (p = [0, 0, 0]) => [-p[0], p[1], p[2]];
const giroDe = (r = [0, 0, 0]) => [-r[0], -r[1], r[2]];

/* As seis faces de um cubo: os quatro cantos (em ordem de UV: alto-esq, alto-dir, baixo-dir, baixo-esq) e a normal. */
function facesDoCubo(cubo, largura, altura) {
  const inflar = cubo.inflate || 0;
  const [ox, oy, oz] = cubo.origin, [w, h, d] = cubo.size;
  const x0 = -(ox + w) - inflar, x1 = -ox + inflar, y0 = oy - inflar, y1 = oy + h + inflar, z0 = oz - inflar, z1 = oz + d + inflar;
  // retângulos de textura por face
  let uv;
  if (Array.isArray(cubo.uv)) {
    const [u, v] = cubo.uv, W = Math.floor(w), H = Math.floor(h), D = Math.floor(d);
    uv = {
      east: [u, v + D, D, H], north: [u + D, v + D, W, H], west: [u + D + W, v + D, D, H], south: [u + D + W + D, v + D, W, H],
      up: [u + D, v, W, D], down: [u + D + W, v + D, W, -D]
    };
    if (cubo.mirror) {
      for (const f of ["north", "south", "up", "down"]) { uv[f][0] += uv[f][2]; uv[f][2] *= -1; }
      const leste = uv.east; uv.east = [uv.west[0] + uv.west[2], uv.west[1], -uv.west[2], uv.west[3]]; uv.west = [leste[0] + leste[2], leste[1], -leste[2], leste[3]];
    }
  } else if (cubo.uv) {
    uv = {};
    for (const [face, def] of Object.entries(cubo.uv)) if (def?.uv) uv[face] = [def.uv[0], def.uv[1], def.uv_size?.[0] ?? 0, def.uv_size?.[1] ?? 0];
  } else return [];

  // no espaço de desenho, o leste do formato (+X dele) fica em -X
  const cantos = {
    north: [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0], [0, 0, -1]],
    south: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1], [0, 0, 1]],
    east: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0], [-1, 0, 0]],
    west: [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [1, 0, 0]],
    up: [[x1, y1, z1], [x0, y1, z1], [x0, y1, z0], [x1, y1, z0], [0, 1, 0]],
    down: [[x1, y0, z0], [x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [0, -1, 0]]
  };
  // tamanho negativo espelha o cubo: com um ou três eixos espelhados ele fica do avesso e só se vê por dentro
  const espelhado = [w < 0, h < 0, d < 0], quantos = espelhado.filter(Boolean).length;
  const faces = [];
  for (const [face, r] of Object.entries(uv)) {
    if (!cantos[face] || (r[2] === 0 && r[3] === 0)) continue;
    const [a, b, c, d2, nominal] = cantos[face];
    const sinal = (quantos + (espelhado[nominal.findIndex((v) => v !== 0)] ? 1 : 0)) % 2 ? -1 : 1;
    const normal = nominal.map((v) => v * sinal);
    const [u, v, uw, vh] = r;
    faces.push({ pontos: [a, b, c, d2], normal, uvs: [[u, v], [u + uw, v], [u + uw, v + vh], [u, v + vh]].map(([s, t]) => [s / largura, t / altura]) });
  }
  return faces;
}

/* pose: por osso, o que a animação parada acrescenta: { giro, mover, escala, oculto } */
function facesDoModelo(geo, pose = {}) {
  const g = geo["minecraft:geometry"]?.[0];
  if (!g) return [];
  const largura = g.description.texture_width, altura = g.description.texture_height;
  const ossos = Object.fromEntries(g.bones.map((o) => [o.name, o]));
  const mundo = {}, some = {};
  function matriz(nome) {
    if (mundo[nome]) return mundo[nome];
    const o = ossos[nome], a = pose[nome] || {};
    const pivo = pivoDe(o.pivot), b = o.rotation || [0, 0, 0], g2 = a.giro || [0, 0, 0];
    let nucleo = girar(giroDe([b[0] + g2[0], b[1] + g2[1], b[2] + g2[2]]));
    if (a.escala) nucleo = vezes(nucleo, [a.escala[0], 0, 0, 0, 0, a.escala[1], 0, 0, 0, 0, a.escala[2], 0, 0, 0, 0, 1]);
    let local = vezes(mover(...pivo), vezes(nucleo, mover(-pivo[0], -pivo[1], -pivo[2])));
    if (a.mover) local = vezes(mover(-a.mover[0], a.mover[1], a.mover[2]), local);
    const pai = o.parent && ossos[o.parent] ? o.parent : null;
    // osso escondido pela pose, ou encolhido a zero pela animação, leva os filhos junto
    some[nome] = Boolean(a.oculto) || (a.escala && a.escala.some((v) => Math.abs(v) < 0.02)) || (pai ? (matriz(pai), some[pai]) : false);
    return (mundo[nome] = pai ? vezes(matriz(pai), local) : local);
  }
  const todas = [];
  for (const o of g.bones) {
    const base = matriz(o.name);
    if (o.neverRender || some[o.name]) continue;
    for (const cubo of o.cubes || []) {
      if (!cubo.size || !cubo.origin) continue;
      const m = cubo.rotation ? vezes(base, emTorno(pivoDe(cubo.pivot), giroDe(cubo.rotation))) : base;
      const semTranslacao = [...m]; semTranslacao[3] = semTranslacao[7] = semTranslacao[11] = 0;
      for (const f of facesDoCubo(cubo, largura, altura)) todas.push({ pontos: f.pontos.map((p) => aplicar(m, p)), normal: aplicar(semTranslacao, f.normal), uvs: f.uvs });
    }
  }
  return todas;
}

/* ---------- desenho ---------- */

const LADO = 560;                                 // desenha grande e reduz depois, para suavizar as bordas
const GUINADA = (-32 * Math.PI) / 180, INCLINA = (14 * Math.PI) / 180;
const LUZ = (() => { const v = [-0.35, 0.86, -0.42], n = Math.hypot(...v); return v.map((c) => c / n); })();

function camera([x, y, z]) {                      // gira o modelo para a vista de três quartos, olhando pela frente
  const cg = Math.cos(GUINADA), sg = Math.sin(GUINADA), ci = Math.cos(INCLINA), si = Math.sin(INCLINA);
  const x1 = x * cg + z * sg, z1 = -x * sg + z * cg;
  return [x1, y * ci + z1 * si, -y * si + z1 * ci];
}

/* texturas: a de base primeiro, depois as camadas que o mod põe por cima
 * ({ data, info, brilha, vidro, semCorte }). */
function desenhar(faces, texturas) {
  const vistas = faces.map((f) => ({ ...f, pontos: f.pontos.map(camera), frente: camera(f.normal) }));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const f of vistas) for (const [x, y] of f.pontos) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const escala = (LADO * 0.92) / Math.max(x1 - x0, y1 - y0, 1e-6);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const cor = new Uint8ClampedArray(LADO * LADO * 4), fundo = new Float32Array(LADO * LADO).fill(Infinity);

  /* Duas passadas: primeiro o que é sólido, com profundidade; depois o que é vidro ou gelatina
   * (Solosis, Frillish), do fundo para a frente, misturado por cima sem tapar. */
  const fundura = (f) => (f.pontos[0][2] + f.pontos[1][2] + f.pontos[2][2] + f.pontos[3][2]) / 4;
  const ordem = [...vistas].sort((a, b) => fundura(b) - fundura(a));
  for (const vidro of [false, true]) for (const f of vidro ? ordem : vistas) for (const camada of texturas) {
    if (f.frente[2] > 1e-6 && !camada.semCorte) continue;      // face de costas: o jogo não desenha
    if (!vidro && camada.vidro) continue;
    const { data: tex, info } = camada;
    const luz = camada.brilha ? 1 : 0.56 + 0.44 * Math.max(0, f.normal[0] * LUZ[0] + f.normal[1] * LUZ[1] + f.normal[2] * LUZ[2]);
    const p = f.pontos.map(([x, y, z]) => [(x - cx) * escala + LADO / 2, LADO / 2 - (y - cy) * escala, z]);
    for (const [i, j, k] of [[0, 1, 2], [0, 2, 3]]) {
      const [ax, ay, az] = p[i], [bx, by, bz] = p[j], [qx, qy, qz] = p[k];
      const area = (bx - ax) * (qy - ay) - (qx - ax) * (by - ay);
      if (Math.abs(area) < 1e-6) continue;
      const minX = Math.max(0, Math.floor(Math.min(ax, bx, qx))), maxX = Math.min(LADO - 1, Math.ceil(Math.max(ax, bx, qx)));
      const minY = Math.max(0, Math.floor(Math.min(ay, by, qy))), maxY = Math.min(LADO - 1, Math.ceil(Math.max(ay, by, qy)));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((bx - px) * (qy - py) - (qx - px) * (by - py)) / area;
          const w1 = ((qx - px) * (ay - py) - (ax - px) * (qy - py)) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
          const z = w0 * az + w1 * bz + w2 * qz;       // menor z = mais perto de quem olha
          const o = y * LADO + x;
          if (z > fundo[o] + 1e-4) continue;
          const u = w0 * f.uvs[i][0] + w1 * f.uvs[j][0] + w2 * f.uvs[k][0], v = w0 * f.uvs[i][1] + w1 * f.uvs[j][1] + w2 * f.uvs[k][1];
          const tx = Math.min(info.width - 1, Math.max(0, Math.floor(u * info.width))), ty = Math.min(info.height - 1, Math.max(0, Math.floor(v * info.height)));
          const t = (ty * info.width + tx) * 4;
          const a = tex[t + 3];
          if (a < 16) continue;                        // textura recortada: pixel vazio não tapa o que está atrás
          if (!vidro) {
            if (a < 242 || (z > fundo[o] - 1e-4 && camada === texturas[0])) continue;
            fundo[o] = z;
            cor[o * 4] = tex[t] * luz; cor[o * 4 + 1] = tex[t + 1] * luz; cor[o * 4 + 2] = tex[t + 2] * luz; cor[o * 4 + 3] = 255;
          } else if (a < 242) {
            const f1 = a / 255, f0 = (cor[o * 4 + 3] / 255) * (1 - f1), soma = f1 + f0;
            for (let c = 0; c < 3; c++) cor[o * 4 + c] = (tex[t + c] * luz * f1 + cor[o * 4 + c] * f0) / soma;
            cor[o * 4 + 3] = soma * 255;
          }
        }
      }
    }
  }
  return sharp(Buffer.from(cor.buffer), { raw: { width: LADO, height: LADO, channels: 4 } });
}

/* A figura em tinta de mapa: quatro tons chapados, do nanquim ao pergaminho, com contorno.
 * Os tons seguem a luz de cada modelo (o mais escuro dele vira nanquim, o mais claro vira papel),
 * para que um Umbreon e um Dewgong guardem os mesmos detalhes. */
const TONS = [[35, 31, 26], [92, 79, 60], [156, 139, 99], [230, 218, 180]];
async function tintar(imagem, lado) {
  const { data } = await imagem.clone().resize(lado, lado, { kernel: "lanczos3" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const saida = Buffer.alloc(lado * lado * 4);
  const solido = (i) => i >= 0 && i < lado * lado && data[i * 4 + 3] > 110;
  const luzDe = (i) => (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
  const luzes = [];
  for (let i = 0; i < lado * lado; i++) if (solido(i)) luzes.push(luzDe(i));
  luzes.sort((a, b) => a - b);
  const baixo = luzes[Math.floor(luzes.length * 0.04)] ?? 0, alto = luzes[Math.floor(luzes.length * 0.96)] ?? 1, faixa = Math.max(0.12, alto - baixo);
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const i = y * lado + x;
      if (!solido(i)) continue;
      const borda = x === 0 || y === 0 || x === lado - 1 || y === lado - 1 || !solido(i - 1) || !solido(i + 1) || !solido(i - lado) || !solido(i + lado);
      const t = borda ? 0 : Math.min(3, Math.max(0, Math.floor(((luzDe(i) - baixo) / faixa) * 3.4 + 0.45)));
      saida[i * 4] = TONS[t][0]; saida[i * 4 + 1] = TONS[t][1]; saida[i * 4 + 2] = TONS[t][2]; saida[i * 4 + 3] = 255;
    }
  }
  return sharp(saida, { raw: { width: lado, height: lado, channels: 4 } }).png({ palette: true, colours: 8, compressionLevel: 9 }).toBuffer();
}

/* ---------- a pose de exibição ---------- */

/* Uma conta da animação no instante zero. As contas são escritas em Molang; aqui só o bastante para lê-las paradas. */
const AJUDA = {
  S: (g) => Math.sin((g * Math.PI) / 180), C: (g) => Math.cos((g * Math.PI) / 180),
  clamp: (v, a, b) => Math.min(b, Math.max(a, v)), lerp: (a, b, t) => a + (b - a) * t
};
function conta(valor) {
  if (typeof valor === "number") return valor;
  if (typeof valor !== "string") return 0;
  let js = valor.toLowerCase().replace(/\s+/g, "")
    .replace(/math\.sin\(/g, "S(").replace(/math\.cos\(/g, "C(").replace(/math\.clamp\(/g, "clamp(").replace(/math\.lerp\(/g, "lerp(")
    .replace(/math\.pi/g, "Math.PI").replace(/math\.(abs|pow|sqrt|min|max|floor|ceil|round)\(/g, "Math.$1(").replace(/math\.random\([^)]*\)/g, "0")
    .replace(/\b(q|query|v|variable|t|temp|c|context)\.[a-z_0-9.]+(\([^()]*\))?/g, "0");
  if (!/^[0-9a-zA-Z_.+\-*/(),?:<>=!&|%]*$/.test(js)) return 0;
  try { const r = new Function("S", "C", "clamp", "lerp", `return (${js});`)(AJUDA.S, AJUDA.C, AJUDA.clamp, AJUDA.lerp); return Number.isFinite(r) ? r : 0; } catch { return 0; }
}
/* O valor de um canal (rotação, posição ou escala) no começo da animação. */
function noInicio(canal, padrao) {
  if (canal === undefined || canal === null) return null;
  if (typeof canal === "number" || typeof canal === "string") { const v = conta(canal); return [v, v, v]; }
  if (Array.isArray(canal)) return [conta(canal[0]), conta(canal[1]), conta(canal[2])];
  const tempos = Object.keys(canal).filter((k) => !Number.isNaN(Number(k))).sort((a, b) => Number(a) - Number(b));
  if (!tempos.length) return canal.post ? noInicio(canal.post, padrao) : canal.pre ? noInicio(canal.pre, padrao) : null;
  const primeiro = canal[tempos[0]];
  return noInicio(primeiro?.post ?? primeiro?.pre ?? primeiro, padrao);
}

const arquivosDeAnimacao = await arquivos(join(ATIVOS, "bedrock", "pokemon", "animations"), ".json");
const animacoes = {};
async function animacao(grupo, nome) {
  if (!(grupo in animacoes)) {
    animacoes[grupo] = {};
    for (const c of arquivosDeAnimacao.filter((x) => x.split(/[\\/]/).pop() === `${grupo}.animation.json`)) { try { Object.assign(animacoes[grupo], (await json(c)).animations || {}); } catch { /* arquivo malformado: fica sem pose */ } }
  }
  return animacoes[grupo][`animation.${grupo}.${nome}`] ?? null;
}

const posers = Object.fromEntries((await arquivos(join(ATIVOS, "bedrock", "pokemon", "posers"), ".json")).map((c) => [c.split(/[\\/]/).pop().replace(".json", ""), c]));
function somar(pose, anim) {
  for (const [osso, canais] of Object.entries(anim.bones || {})) {
    const o = (pose[osso] ??= {});
    const giro = noInicio(canais.rotation), mov = noInicio(canais.position), escala = noInicio(canais.scale);
    if (giro) o.giro = giro;
    if (mov) o.mover = mov;
    if (escala) o.escala = escala;
  }
  return pose;
}
/* Parte das espécies ainda tem a pose escrita no código do mod, e não em arquivo.
 * Para elas vale a animação parada com o nome de sempre. */
const PARADAS = ["summary_idle", "ground_idle", "idle", "air_idle", "water_idle", "render"];
async function poseDeExibicao(nomeDoPoser) {
  const pose = {};
  if (!posers[nomeDoPoser]) {
    for (const nome of PARADAS) { const anim = await animacao(nomeDoPoser, nome); if (anim) return somar(pose, anim); }
    return pose;
  }
  const p = await json(posers[nomeDoPoser]);
  const todas = Object.values(p.poses || {});
  const tem = (t) => (x) => (x.poseTypes || []).includes(t);
  const escolhida = todas.find((x) => tem("PROFILE")(x) && !x.isBattle) ?? todas.find(tem("PROFILE")) ?? todas.find(tem("PORTRAIT")) ?? todas.find((x) => tem("STAND")(x) && !x.isBattle) ?? todas[0];
  if (!escolhida) return pose;
  for (const a of escolhida.animations || []) {
    const m = typeof a === "string" && /bedrock\(\s*'([^']+)'\s*,\s*'([^']+)'/.exec(a);
    const anim = m ? await animacao(m[1], m[2]) : null;
    if (!anim) continue;
    somar(pose, anim);
    break;                                        // a primeira animação de corpo inteiro é a pose
  }
  for (const parte of [...(p.transformedParts || []), ...(escolhida.transformedParts || [])]) {
    const o = (pose[parte.part] ??= {});
    if (parte.isVisible === false || parte.visible === false) o.oculto = true;
    if (parte.position) o.mover = (o.mover || [0, 0, 0]).map((v, k) => v + parte.position[k]);
    if (parte.rotation) o.giro = (o.giro || [0, 0, 0]).map((v, k) => v + parte.rotation[k]);
  }
  return pose;
}

/* ---------- qual modelo e qual textura cada espécie usa ---------- */

const chaveDe = (t) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
const cobblemon = JSON.parse(await readFile(join(RAIZ, "dados", "cobblemon.json"), "utf8"));
const numeroDe = Object.fromEntries(Object.values(cobblemon.especies).filter((e) => e.impl).map((e) => [chaveDe(e.nome), e.n]));

const modelos = Object.fromEntries((await arquivos(join(ATIVOS, "bedrock", "pokemon", "models"), ".geo.json")).map((c) => [c.split(/[\\/]/).pop().replace(".geo.json", ""), c]));
const escolhas = {};                              // número -> { modelo, textura }
for (const caminho of (await arquivos(join(ATIVOS, "bedrock", "pokemon", "resolvers"), ".json")).sort()) {
  const r = await json(caminho);
  const n = numeroDe[chaveDe(String(r.species || "").split(":").pop())];
  if (!n || escolhas[n]) continue;
  const base = (r.variations || []).find((v) => !(v.aspects || []).length && v.model && v.texture) ?? (r.variations || []).find((v) => v.model && v.texture);
  if (!base) continue;
  const textura = typeof base.texture === "string" ? base.texture : base.texture?.frames?.[0];
  const poser = (base.poser ?? (r.variations || []).find((v) => v.poser)?.poser ?? "").split(":").pop();
  const sim = (v) => String(v).toLowerCase() === "true";
  const camadas = (base.layers || []).map((c) => ({ textura: typeof c.texture === "string" ? c.texture : c.texture?.frames?.[0], brilha: sim(c.emissive), vidro: sim(c.translucent), semCorte: sim(c.translucent) && !sim(c.translucent_cull) }))
    .filter((c) => c.textura).map((c) => ({ ...c, textura: join(ATIVOS, c.textura.split(":").pop()) }));
  if (textura) escolhas[n] = { modelo: base.model.split(":").pop().replace(".geo", ""), textura: join(ATIVOS, textura.split(":").pop()), poser, camadas };
}

/* ---------- execução ---------- */

const pedidos = args.map(Number).filter(Boolean);
const numeros = (pedidos.length ? pedidos : Object.keys(escolhas).map(Number)).sort((a, b) => a - b);
await mkdir(SAIDA, { recursive: true });
const feitos = [], falhas = [], previas = [];
for (const n of numeros) {
  const e = escolhas[n];
  try {
    if (!e || !modelos[e.modelo] || !existsSync(e.textura)) throw new Error(e ? `sem ${modelos[e.modelo] ? "textura" : "modelo"}` : "sem resolvedor");
    const faces = facesDoModelo(await json(modelos[e.modelo]), await poseDeExibicao(e.poser));
    if (!faces.length) throw new Error("modelo sem cubos");
    const ler = (c) => sharp(c).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const texturas = [await ler(e.textura)];
    for (const c of e.camadas) if (existsSync(c.textura)) texturas.push({ ...(await ler(c.textura)), brilha: c.brilha, vidro: c.vidro, semCorte: c.semCorte });
    const imagem = desenhar(faces, texturas);
    await writeFile(join(SAIDA, `${n}.webp`), await imagem.clone().resize(400, 400, { kernel: "lanczos3" }).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer());
    await writeFile(join(SAIDA, `${n}-tinta.png`), await tintar(imagem, 96));
    if (PREVIA) previas.push(await imagem.clone().resize(200, 200).png().toBuffer());
    feitos.push(n);
  } catch (erro) {
    falhas.push(`${n} (${erro.message})`);
  }
}
// o build só oferece o modelo das espécies que deram certo
if (!pedidos.length) await writeFile(join(RAIZ, "dados", "modelos.json"), JSON.stringify(feitos), "utf8");
if (PREVIA && previas.length) {
  const colunas = Math.min(8, previas.length), linhas = Math.ceil(previas.length / colunas);
  await sharp({ create: { width: colunas * 204, height: linhas * 204, channels: 3, background: "#C6C6C6" } })
    .composite(previas.map((input, i) => ({ input, left: (i % colunas) * 204 + 2, top: Math.floor(i / colunas) * 204 + 2 }))).png().toFile(PREVIA);
}
console.log(`Modelos: ${feitos.length} desenhados em src/arte/modelo/${falhas.length ? `; ${falhas.length} sem desenho: ${falhas.slice(0, 30).join(", ")}${falhas.length > 30 ? "..." : ""}` : ""}`);
