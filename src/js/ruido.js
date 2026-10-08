/* Ruído de valor, suave e repetível: a mesma semente dá sempre o mesmo terreno.
 * É o que desenha o mapa de blocos da abertura da edição Cobblemon (src/js/cobblemon-inicio.js). */

function acaso(ix, iy, s) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

export function ruido(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y);
  let fx = x - ix, fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = acaso(ix, iy, s), b = acaso(ix + 1, iy, s);
  const c = acaso(ix, iy + 1, s), d = acaso(ix + 1, iy + 1, s);
  const cima = a + (b - a) * fx, baixo = c + (d - c) * fx;
  return (cima + (baixo - cima) * fy) * 2 - 1;
}

/* Malha de gx por gy nós cobrindo o retângulo [x0,x1] x [y0,y1] do mundo. */
