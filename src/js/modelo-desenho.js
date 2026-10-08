/* O desenho de software de um modelo do Cobblemon: pinta as faces, com a textura, numa imagem RGBA.
 * É o que o visor usa onde o navegador não entrega WebGL; roda também no Node, para os testes.
 * As faces vêm de facesDoExportado (modelo-malha.js). A vista é a de scripts/modelos.mjs: sem perspectiva,
 * com guinada e inclinação, e o z menor fica mais perto de quem olha. */

const LUZ = (() => { const v = [-0.35, 0.86, -0.42], n = Math.hypot(...v); return v.map((c) => c / n); })();

/* O centro e o raio do modelo: com eles a escala não muda enquanto ele gira. */
export function medidas(faces) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const f of faces) for (const p of f.pontos) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[k]); max[k] = Math.max(max[k], p[k]); }
  const centro = min.map((v, k) => (v + max[k]) / 2);
  let raio = 0;
  for (const f of faces) for (const p of f.pontos) raio = Math.max(raio, Math.hypot(p[0] - centro[0], p[1] - centro[1], p[2] - centro[2]));
  return { centro, raio: raio || 1 };
}

/* As três linhas da rotação que leva o modelo para a vista. */
export function rotacao(guinada, inclina) {
  const cg = Math.cos(guinada), sg = Math.sin(guinada), ci = Math.cos(inclina), si = Math.sin(inclina);
  return [[cg, 0, sg], [-sg * si, ci, cg * si], [-sg * ci, -si, cg * ci]];
}

/* Pinta em `cor` (Uint8ClampedArray de lado × lado × 4, já zerado). textura: { data, width, height } em RGBA.
 * Primeiro o que é sólido, com profundidade; depois o que é translúcido, do fundo para a frente. */
export function desenharModelo(cor, lado, faces, textura, { centro, raio }, guinada, inclina, zoom = 1, dx = 0, dy = 0) {
  const [X, Y, Z] = rotacao(guinada, inclina), escala = (0.95 / raio) * (lado / 2) * zoom, meio = lado / 2;
  const fundo = new Float32Array(lado * lado).fill(Infinity), { data: tex, width, height } = textura;
  const girar = (v, p) => v[0] * p[0] + v[1] * p[1] + v[2] * p[2];
  const vistas = [];
  for (const f of faces) {
    const n = f.normal, tamanho = Math.hypot(n[0], n[1], n[2]) || 1, nv = [girar(X, n) / tamanho, girar(Y, n) / tamanho, girar(Z, n) / tamanho];
    if (nv[2] > 1e-6) continue;                      // face de costas: o jogo não desenha
    const p = f.pontos.map((q) => { const r = [q[0] - centro[0], q[1] - centro[1], q[2] - centro[2]]; return [meio + girar(X, r) * escala + dx * meio, meio - girar(Y, r) * escala - dy * meio, girar(Z, r)]; });
    vistas.push({ p, uvs: f.uvs, luz: 0.56 + 0.44 * Math.max(0, nv[0] * LUZ[0] + nv[1] * LUZ[1] + nv[2] * LUZ[2]), fundura: (p[0][2] + p[1][2] + p[2][2] + p[3][2]) / 4 });
  }
  const ordem = [...vistas].sort((a, b) => b.fundura - a.fundura);
  for (const vidro of [false, true]) for (const f of vidro ? ordem : vistas) {
    const { p, uvs, luz } = f;
    for (const [i, j, k] of [[0, 1, 2], [0, 2, 3]]) {
      const [ax, ay, az] = p[i], [bx, by, bz] = p[j], [qx, qy, qz] = p[k];
      const area = (bx - ax) * (qy - ay) - (qx - ax) * (by - ay);
      if (Math.abs(area) < 1e-6) continue;
      const minX = Math.max(0, Math.floor(Math.min(ax, bx, qx))), maxX = Math.min(lado - 1, Math.ceil(Math.max(ax, bx, qx)));
      const minY = Math.max(0, Math.floor(Math.min(ay, by, qy))), maxY = Math.min(lado - 1, Math.ceil(Math.max(ay, by, qy)));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((bx - px) * (qy - py) - (qx - px) * (by - py)) / area, w1 = ((qx - px) * (ay - py) - (ax - px) * (qy - py)) / area, w2 = 1 - w0 - w1;
          if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
          const z = w0 * az + w1 * bz + w2 * qz, o = y * lado + x;
          if (z > fundo[o] + 1e-4) continue;
          const u = w0 * uvs[i][0] + w1 * uvs[j][0] + w2 * uvs[k][0], v = w0 * uvs[i][1] + w1 * uvs[j][1] + w2 * uvs[k][1];
          const t = (Math.min(height - 1, Math.max(0, Math.floor(v * height))) * width + Math.min(width - 1, Math.max(0, Math.floor(u * width)))) * 4, a = tex[t + 3];
          if (a < 16) continue;                      // textura recortada: ponto vazio não tapa o que está atrás
          if (!vidro) {
            if (a < 242 || z > fundo[o] - 1e-4) continue;
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
  return cor;
}
