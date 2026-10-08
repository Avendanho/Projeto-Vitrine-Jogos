/* As contas da roda de tipos, sem tocar na página. `tipos` é a lista dos 18 nomes e `tabela[a][d]` o fator
 * do tipo atacante `a` contra o tipo defensor `d` (js/dados/tipos.js). */

/* Tudo o que um tipo faz e sofre, em seis listas:
 *   atinge / poucoEfeito / naoAfeta   quando ele ataca: em dobro, pela metade, sem efeito
 *   apanha / resiste / imune          quando ele defende: recebe em dobro, pela metade, não recebe */
export function relacoes(tabela, tipos, tipo) {
  const i = tipos.indexOf(tipo);
  if (i < 0) return null;
  const atacando = (teste) => tipos.filter((_, d) => teste(tabela[i][d]));
  const defendendo = (teste) => tipos.filter((_, a) => teste(tabela[a][i]));
  const dobro = (f) => f > 1, metade = (f) => f > 0 && f < 1, nada = (f) => f === 0;
  return {
    atinge: atacando(dobro), poucoEfeito: atacando(metade), naoAfeta: atacando(nada),
    apanha: defendendo(dobro), resiste: defendendo(metade), imune: defendendo(nada)
  };
}

/* Onde fica o item `i` de `n` numa roda: em porcentagem de um quadrado, começando no alto e girando no
 * sentido do relógio. */
export function lugarNaRoda(i, n, raio = 44) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  return { x: 50 + Math.cos(a) * raio, y: 50 + Math.sin(a) * raio };
}

/* O trecho de linha entre dois lugares da roda, encurtado nas duas pontas para não entrar nos selos. */
export function trecho(de, para, folga = 6) {
  const dx = para.x - de.x, dy = para.y - de.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  return { x1: de.x + ux * folga, y1: de.y + uy * folga, x2: para.x - ux * folga, y2: para.y - uy * folga };
}
