/* A língua em que o build está escrevendo uma página. Os modelos são os mesmos nas duas línguas: onde há
 * uma frase, eles a escrevem duas vezes, lado a lado, com b("em português", "in English"), e a língua da vez
 * escolhe qual sai. Os endereços saem em português e são trocados pelos pares em inglês no fim (linksEmIngles). */
import { rotaEmIngles } from "../src/js/lingua-rotas.js";

let atual = "pt-BR";
export const linguaAtual = () => atual;
export const ingles = () => atual === "en";

/* Roda `fazer` com a língua trocada e devolve o que ele devolver. */
export function emLingua(lingua, fazer) {
  const antes = atual;
  atual = lingua;
  try { return fazer(); } finally { atual = antes; }
}

/* A frase na língua da vez. */
export const b = (pt, en) => (atual === "en" ? en : pt);
/* O endereço de uma página na língua da vez. */
export const rota = (caminho) => (atual === "en" ? rotaEmIngles(caminho) : caminho);

/* Troca os endereços internos de uma página pelos pares em inglês. Quem precisa continuar apontando para a
 * página em português (o link "Português" do menu) escreve o endereço com o prefixo "pt:". */
export function linksEmIngles(html) {
  return html
    .replace(/\b(href|action)="(\/[^"#?]*)([^"]*)"/g, (_, atributo, caminho, resto) => `${atributo}="${rotaEmIngles(caminho)}${resto}"`)
    .replace(/\b(href|action)="pt:/g, '$1="');
}

const UNIDADES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const DEZENAS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
/* Um número de 0 a 99 por extenso, em inglês. */
export const emIngles = (n) => (n < 20 ? UNIDADES[n] : n < 100 ? DEZENAS[Math.floor(n / 10)] + (n % 10 ? `-${UNIDADES[n % 10]}` : "") : String(n));
