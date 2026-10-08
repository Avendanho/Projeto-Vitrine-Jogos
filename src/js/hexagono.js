/* O hexágono de atributos — o movimento-assinatura da edição Pokémon do PokéAtlas.
 *
 * Um jogo tem seis notas (1 a 5). Cada nota puxa um vértice numa direção fixa, como no hexágono das telas
 * de resumo dos jogos: quanto mais alta a nota, mais longe do centro o vértice vai. A forma que sobra é o
 * perfil do jogo. A bússola desenha o perfil de quem responde, e a comparação põe um perfil sobre o outro.
 *
 * Este módulo não toca na página: serve ao navegador e ao build (SVG).
 */

export const EIXOS = [
  { id: "exploracao", nome: "Exploração", ang: -90 },
  { id: "liberdade", nome: "Liberdade", ang: -30 },
  { id: "competitivo", nome: "Competitivo", ang: 30 },
  { id: "dificuldade", nome: "Dificuldade", ang: 90 },
  { id: "historia", nome: "História", ang: 150 },
  { id: "nostalgia", nome: "Nostalgia", ang: 210 }
];
export const NOTA_MAXIMA = 5;
const MIOLO = 0.14;                                   // com tudo zerado ainda sobra um hexágono pequeno no centro

export const valoresDe = (atributos) => EIXOS.map((e) => atributos[e.id] || 0);

/* A que distância do centro fica o vértice de uma nota, de 0 (centro) a 1 (borda). */
export const alcance = (nota) => MIOLO + (1 - MIOLO) * Math.min(NOTA_MAXIMA, Math.max(0, nota)) / NOTA_MAXIMA;

/* O caminho de volta: que nota põe o vértice a certa distância do centro (0 a 1). É o que deixa arrastar um
 * vértice com o dedo e ler a nota de onde ele parou. */
export const notaDoAlcance = (distancia) => Math.min(NOTA_MAXIMA, Math.max(0, ((distancia - MIOLO) / (1 - MIOLO)) * NOTA_MAXIMA));

/* Os seis vértices de um perfil, num círculo de raio `raio` com centro em (cx, cy). */
export function vertices(valores, raio = 1, cx = 0, cy = 0) {
  return EIXOS.map((e, i) => {
    const a = (e.ang * Math.PI) / 180, r = raio * alcance(valores[i] ?? 0);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
}
export const caminho = (pontos) => `M${pontos.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;

/* As cores do desenho. "tela" é o perfil sobre a tela clara; "noite", sobre a tela apagada. */
export const TEMAS = {
  tela: { grade: "#B9C4AC", raio: "#B9C4AC", fundo: "#E3EAD9", forma: "#FFCB05", contorno: "#20232B", ponto: "#20232B" },
  noite: { grade: "rgba(241,245,234,0.22)", raio: "rgba(241,245,234,0.22)", fundo: "rgba(241,245,234,0.05)", forma: "#FFCB05", contorno: "#FFF3B0", ponto: "#FFF3B0" }
};

/* A grade (o hexágono cheio, os anéis de cada nota e os seis raios) de um desenho de lado `lado`. */
export function gradeDoHexagono(lado, tema) {
  const c = lado / 2, raio = lado * 0.44, cheio = Array(6).fill(NOTA_MAXIMA);
  const aneis = [1, 2, 3, 4].map((n) => `<path d="${caminho(vertices(Array(6).fill(n), raio, c, c))}" fill="none" stroke="${tema.grade}" stroke-width="${lado / 320}"/>`).join("");
  const raios = vertices(cheio, raio, c, c).map(([x, y]) => `<path d="M${c} ${c}L${x.toFixed(1)} ${y.toFixed(1)}" stroke="${tema.raio}" stroke-width="${lado / 320}"/>`).join("");
  return `<path d="${caminho(vertices(cheio, raio, c, c))}" fill="${tema.fundo}" stroke="${tema.grade}" stroke-width="${lado / 160}" stroke-linejoin="round"/>${aneis}${raios}`;
}

/* O desenho completo de um perfil, como SVG. `cor` troca a cor da forma (as séries da comparação). */
export function svgHexagono(valores, variante = "tela", lado = 480) {
  const tema = TEMAS[variante] ?? { ...TEMAS.tela, forma: variante }, c = lado / 2, pontos = vertices(valores, lado * 0.44, c, c);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${lado} ${lado}" width="${lado}" height="${lado}">${TEMAS[variante] ? gradeDoHexagono(lado, tema) : ""}` +
    `<path d="${caminho(pontos)}" fill="${tema.forma}" fill-opacity="${TEMAS[variante] ? 0.92 : 0.5}" stroke="${TEMAS[variante] ? tema.contorno : tema.forma}" stroke-width="${lado / 96}" stroke-linejoin="round"/>` +
    (TEMAS[variante] ? pontos.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${lado / 68}" fill="${tema.ponto}"/>`).join("") : "") + "</svg>";
}

/* ---------- semelhança entre perfis ---------- */

/* Correlação entre os formatos (onde cada perfil é alto e baixo), suavizada pela distância direta entre
 * as notas. Devolve de -1 a 1. */
export function encaixe(u, g) {
  const n = u.length;
  let mu = 0, mg = 0;
  for (let i = 0; i < n; i++) { mu += u[i]; mg += g[i]; }
  mu /= n; mg /= n;
  let num = 0, du = 0, dg = 0, dist = 0;
  for (let i = 0; i < n; i++) {
    num += (u[i] - mu) * (g[i] - mg);
    du += (u[i] - mu) ** 2;
    dg += (g[i] - mg) ** 2;
    dist += (u[i] - g[i]) ** 2;
  }
  const correlacao = du > 0 && dg > 0 ? num / Math.sqrt(du * dg) : 0;
  const proximidade = 1 - Math.sqrt(dist / n) / 5;
  return 0.7 * correlacao + 0.3 * (proximidade * 2 - 1);
}
