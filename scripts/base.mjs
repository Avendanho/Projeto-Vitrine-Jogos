/* O que todos os modelos de página compartilham: cores, dados gerados e pequenas utilidades de texto. */
import { readFileSync } from "node:fs";

export const MAR = "#D2E1DF", TINTA = "#0F2A3A", NOITE = "#0C2733", PAPEL = "#F1E8CF";

const lerDados = (nome) => JSON.parse(readFileSync(new URL(`../dados/${nome}`, import.meta.url), "utf8"));
export const POKEDEX = lerDados("pokedex.json");     // gerado por scripts/pokedex.mjs
export const FICHAS = lerDados("fichas.json");       // gerado por scripts/fichas.mjs
export const CARTAS = lerDados("cartas.json");       // gerado por scripts/cartas.mjs
export const COBBLEMON = lerDados("cobblemon.json"); // gerado por scripts/cobblemon.mjs
export const FORMAS_COM_ARTE = new Set(lerDados("formas-com-arte.json"));   // gerado por scripts/arte.mjs --formas
export const MODELOS = new Set(lerDados("modelos.json"));                   // gerado por scripts/modelos.mjs: espécies desenhadas a partir do modelo do mod

export const ORDEM_TIPOS = ["Normal", "Fogo", "Água", "Planta", "Elétrico", "Gelo", "Lutador", "Venenoso", "Terrestre",
  "Voador", "Psíquico", "Inseto", "Pedra", "Fantasma", "Dragão", "Sombrio", "Aço", "Fada"];

export const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const semAcento = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

const EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze",
  "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte"];
const DEZENAS = { 20: "vinte", 30: "trinta", 40: "quarenta", 50: "cinquenta" };
export function extenso(n) {
  if (n <= 20) return EXTENSO[n];
  const d = Math.floor(n / 10) * 10, u = n % 10;
  return DEZENAS[d] ? (u ? `${DEZENAS[d]} e ${EXTENSO[u]}` : DEZENAS[d]) : String(n);
}

/* "A, B e C" */
export const enumerar = (itens) => (itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`);
/* 1025 -> "1.025"; 0.5 -> "0,5" */
export const numero = (n, casas = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/* Endereço da página de uma espécie, em cada edição. */
export const enderecoEspecie = (id) => `/pokedex/${FICHAS[id].slug}/`;
export const enderecoCobblemon = (id) => `/cobblemon/pokemon/${FICHAS[id].slug}/`;
