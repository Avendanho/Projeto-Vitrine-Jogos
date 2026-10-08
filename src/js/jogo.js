/* Página de jogo: o perfil desenhado ao vivo e a leitura das notas ligada a ele. */
import { JOGOS } from "./dados.js";
import { hexVivo } from "./hex-vivo.js";

const artigo = document.querySelector(".jogo");
const jogo = JOGOS.find((j) => j.slug === artigo.dataset.slug);
const caixa = artigo.querySelector(".hex-vivo");

// o perfil abre do centro até as notas do jogo
const perfil = hexVivo(caixa.querySelector("canvas"), { pulso: true });
perfil.definir([{ valores: [0, 0, 0, 0, 0, 0] }]);
requestAnimationFrame(() => requestAnimationFrame(() => { caixa.classList.add("vivo"); perfil.definir([{ valores: jogo.valores }]); }));

/* apontar para uma linha da leitura destaca o vértice correspondente no hexágono */
const direcoes = [...caixa.querySelectorAll(".hex-eixo")];
function destacar(eixo) {
  for (const d of direcoes) d.classList.toggle("ativo", d.dataset.eixo === eixo);
}
for (const linha of artigo.querySelectorAll(".leitura-lista li")) {
  linha.addEventListener("pointerenter", () => destacar(linha.dataset.eixo));
  linha.addEventListener("pointerleave", () => destacar(null));
}
