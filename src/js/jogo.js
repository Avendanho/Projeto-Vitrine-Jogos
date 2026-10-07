/* Página de jogo: a ilha desenhada ao vivo e a leitura do relevo ligada a ela. */
import { sementeDe } from "./relevo.js";
import { JOGOS } from "./dados.js";
import { ilhaViva } from "./ilha-viva.js";

const artigo = document.querySelector(".jogo");
const jogo = JOGOS.find((j) => j.slug === artigo.dataset.slug);
const caixa = artigo.querySelector(".mapa-vivo");

const ilha = ilhaViva(caixa.querySelector("canvas"), { g: 96, emergir: false });
ilha.definir([{ valores: jogo.valores, semente: sementeDe(jogo.slug) }]);
requestAnimationFrame(() => requestAnimationFrame(() => caixa.classList.add("vivo")));

/* apontar para uma linha da leitura destaca a direção correspondente no mapa */
const direcoes = [...caixa.querySelectorAll(".mapa-direcao")];
function destacar(eixo) {
  for (const d of direcoes) d.classList.toggle("ativo", d.dataset.eixo === eixo);
}
for (const linha of artigo.querySelectorAll(".relevo-lista li")) {
  linha.addEventListener("pointerenter", () => destacar(linha.dataset.eixo));
  linha.addEventListener("pointerleave", () => destacar(null));
}
