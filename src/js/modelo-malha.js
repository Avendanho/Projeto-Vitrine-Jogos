/* A geometria dos modelos do Cobblemon (formato Bedrock: ossos, cubos, UV), sem tocar em arquivo nem em
 * página. Serve aos dois lados: scripts/modelos.mjs monta com ela o desenho parado de cada espécie, e
 * src/js/modelo3d.js remonta no navegador o modelo que gira, a partir do arquivo enxuto de src/modelos3d/.
 *
 * As matrizes são 4×4 em ordem de linhas (a translação fica nas posições 3, 7 e 11). */

export const identidade = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
export function vezes(a, b) {
  const r = new Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) r[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j] + a[i * 4 + 3] * b[12 + j];
  return r;
}
export const mover = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
export function girar([gx, gy, gz]) {                   // ordem ZYX, como no editor em que os modelos são feitos
  const [x, y, z] = [gx, gy, gz].map((g) => (g * Math.PI) / 180);
  const cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
  const rx = [1, 0, 0, 0, 0, cx, -sx, 0, 0, sx, cx, 0, 0, 0, 0, 1];
  const ry = [cy, 0, sy, 0, 0, 1, 0, 0, -sy, 0, cy, 0, 0, 0, 0, 1];
  const rz = [cz, -sz, 0, 0, sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return vezes(rz, vezes(ry, rx));
}
/* girar em torno de um ponto */
export const emTorno = (pivo, giro) => vezes(mover(...pivo), vezes(girar(giro), mover(-pivo[0], -pivo[1], -pivo[2])));
export const aplicar = (m, [x, y, z]) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];

/* ---------- da geometria Bedrock a uma lista de faces ---------- */

/* O formato guarda X ao contrário do espaço em que se desenha: X e as rotações em X e Y trocam de sinal. */
export const pivoDe = (p = [0, 0, 0]) => [-p[0], p[1], p[2]];
export const giroDe = (r = [0, 0, 0]) => [-r[0], -r[1], r[2]];

/* As seis faces de um cubo: os quatro cantos (em ordem de UV: alto-esq, alto-dir, baixo-dir, baixo-esq) e a normal. */
export function facesDoCubo(cubo, largura, altura) {
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


/* O modelo como vai para o navegador: { t: [largura, altura da textura], m: [matrizes de 12 números],
 * c: [[matriz, x, y, z, largura, altura, fundo, folga, uv], ...] }. Cada cubo já traz a matriz que o põe
 * no lugar, com a pose incluída; uv é [u, v] (ou [u, v, 1] se espelhado) na forma de caixa, ou um objeto
 * { face: [u, v, largura, altura] } quando cada face tem o seu recorte. Devolve as faces prontas. */
export function facesDoExportado(modelo) {
  const [largura, altura] = modelo.t, faces = [];
  for (const [qual, ox, oy, oz, w, h, d, folga, uv] of modelo.c) {
    const m = [...modelo.m[qual], 0, 0, 0, 1], semTranslacao = [...m];
    semTranslacao[3] = semTranslacao[7] = semTranslacao[11] = 0;
    const cubo = Array.isArray(uv)
      ? { origin: [ox, oy, oz], size: [w, h, d], inflate: folga, uv: [uv[0], uv[1]], mirror: uv[2] === 1 }
      : { origin: [ox, oy, oz], size: [w, h, d], inflate: folga, uv: Object.fromEntries(Object.entries(uv).map(([face, r]) => [face, { uv: [r[0], r[1]], uv_size: [r[2], r[3]] }])) };
    for (const f of facesDoCubo(cubo, largura, altura)) faces.push({ pontos: f.pontos.map((p) => aplicar(m, p)), normal: aplicar(semTranslacao, f.normal), uvs: f.uvs });
  }
  return faces;
}
