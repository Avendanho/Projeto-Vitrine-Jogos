/* A língua da página, para os scripts do navegador. As páginas existem em português e em inglês com o mesmo
 * código: onde um script escreve uma frase, ele a escreve duas vezes, com b("em português", "in English"), e
 * onde monta um endereço, passa por rota(). (No build, o par deste módulo é scripts/lingua.mjs.) */
import { rotaEmIngles } from "./lingua-rotas.js";

/* Fora do navegador (nos testes das regras) não há página: vale o português. */
export const INGLES = typeof document !== "undefined" && document.documentElement.lang === "en";
export const b = (pt, en) => (INGLES ? en : pt);
export const rota = (caminho) => (INGLES ? rotaEmIngles(caminho) : caminho);

/* Os 18 tipos. Nos dados e nos filtros o tipo é sempre o nome em português; isto é só o que se lê.
 * (A mesma lista está em dados/en.mjs, e um teste confere se as duas batem.) */
export const TIPOS_EN = {
  Normal: "Normal", Fogo: "Fire", "Água": "Water", Planta: "Grass", "Elétrico": "Electric", Gelo: "Ice", Lutador: "Fighting",
  Venenoso: "Poison", Terrestre: "Ground", Voador: "Flying", "Psíquico": "Psychic", Inseto: "Bug", Pedra: "Rock",
  Fantasma: "Ghost", "Dragão": "Dragon", Sombrio: "Dark", "Aço": "Steel", Fada: "Fairy"
};
export const nomeDoTipo = (tipo) => (INGLES ? TIPOS_EN[tipo] ?? tipo : tipo);
/* "Red, Blue e Yellow": os nomes dos jogos já são os originais, só a conjunção muda. */
export const nomeDoJogo = (nome) => (INGLES ? nome.replace(/ e /g, " and ") : nome);
/* 1025 -> "1.025" ou "1,025"; 0.5 -> "0,5" ou "0.5". */
export const numero = (n, casas = 0) => n.toLocaleString(INGLES ? "en-US" : "pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
/* "A, B e C" ou "A, B and C". */
export const enumerar = (itens) => (itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} ${INGLES ? "and" : "e"} ${itens[itens.length - 1]}`);
