/* A malha e as curvas de nível que scripts/cartas.mjs usa para traçar o contorno das regiões.
 * Só roda em desenvolvimento: o que ele gera fica em dados/cartas.json. */

/* As cinco alturas em que o terreno é cortado, da costa ao pico. */
export const NIVEIS = [0.5, 1.3, 2.1, 2.9, 3.7];

/* Malha de gx por gy nós cobrindo o retângulo [x0,x1] x [y0,y1] do mundo. */
export function criarMalha(gx, gy, x0, x1, y0, y1) {
  const n = gx * gy;
  const xs = new Float32Array(n), ys = new Float32Array(n);
  for (let j = 0; j < gy; j++) {
    for (let i = 0; i < gx; i++) {
      xs[j * gx + i] = x0 + ((x1 - x0) * i) / (gx - 1);
      ys[j * gx + i] = y0 + ((y1 - y0) * j) / (gy - 1);
    }
  }
  return {
    gx, gy, n, xs, ys, x0, x1, y0, y1,
    h: new Float32Array(n),
    _a: new Int32Array(n * 4), _b: new Int32Array(n * 4),
    _e1: new Int32Array(n * 2), _e2: new Int32Array(n * 2),
    _u: new Uint8Array(n * 4)
  };
}

/* Preenche malha.h.

/* Curvas de nível por "marching squares", com os segmentos já ligados em anéis.
 * Devolve uma lista de anéis; cada anel é [i0, j0, i1, j1, ...] em coordenadas da malha. */
export function aneis(malha, nivel) {
  const { gx, gy, h, _a: sa, _b: sb, _e1: e1, _e2: e2, _u: usado } = malha;
  let ns = 0;
  e1.fill(-1); e2.fill(-1);

  function seg(p, q) {
    sa[ns] = p; sb[ns] = q;
    if (e1[p] < 0) e1[p] = ns; else e2[p] = ns;
    if (e1[q] < 0) e1[q] = ns; else e2[q] = ns;
    ns++;
  }

  for (let j = 0; j < gy - 1; j++) {
    for (let i = 0; i < gx - 1; i++) {
      const k = j * gx + i;
      const a = h[k], b = h[k + 1], c = h[k + gx + 1], d = h[k + gx];
      const caso = (a > nivel ? 8 : 0) | (b > nivel ? 4 : 0) | (c > nivel ? 2 : 0) | (d > nivel ? 1 : 0);
      if (caso === 0 || caso === 15) continue;
      const T = 2 * k, B = 2 * (k + gx), L = 2 * k + 1, R = 2 * (k + 1) + 1;
      switch (caso) {
        case 1: case 14: seg(L, B); break;
        case 2: case 13: seg(B, R); break;
        case 3: case 12: seg(L, R); break;
        case 4: case 11: seg(T, R); break;
        case 6: case 9: seg(T, B); break;
        case 7: case 8: seg(T, L); break;
        case 5:
          if ((a + b + c + d) / 4 > nivel) { seg(T, L); seg(B, R); } else { seg(T, R); seg(L, B); }
          break;
        case 10:
          if ((a + b + c + d) / 4 > nivel) { seg(T, R); seg(L, B); } else { seg(T, L); seg(B, R); }
          break;
      }
    }
  }

  usado.fill(0, 0, ns);
  const lista = [];
  function ponto(e, anel) {
    const k = e >> 1, i = k % gx, j = (k / gx) | 0;
    if (e & 1) { const p = h[k], q = h[k + gx]; anel.push(i, j + (nivel - p) / (q - p)); }
    else { const p = h[k], q = h[k + 1]; anel.push(i + (nivel - p) / (q - p), j); }
  }
  for (let s = 0; s < ns; s++) {
    if (usado[s]) continue;
    const anel = [];
    let atual = s, borda = sb[s];
    ponto(sa[s], anel);
    for (;;) {
      usado[atual] = 1;
      ponto(borda, anel);
      const prox = e1[borda] === atual ? e2[borda] : e1[borda];
      if (prox < 0 || usado[prox]) break;
      atual = prox;
      borda = sa[prox] === borda ? sb[prox] : sa[prox];
    }
    if (anel.length >= 8) lista.push(anel);
  }
  return lista;
}
