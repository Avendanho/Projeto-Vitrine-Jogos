/* O que todos os modelos de página compartilham: cores, dados gerados e pequenas utilidades de texto. */
import { ingles, emIngles } from "./lingua.mjs";
import { TIPOS_EN } from "../dados/en.mjs";
import { readFileSync } from "node:fs";

/* O endereço público do atlas, para o que precisa de endereço inteiro: a imagem de prévia dos links, o
 * endereço canônico de cada página e o mapa do site. ATLAS_SITE troca o padrão (uma cópia em outro domínio). */
export const SITE = (process.env.ATLAS_SITE || "https://pokeatlas-eight.vercel.app").replace(/\/$/, "");

/* As cores da edição Pokémon que os modelos precisam conhecer: a tela clara do aparelho, a tinta dela, a tela
 * apagada (a cena escura da abertura) e o texto claro sobre ela. O resto está em src/pokedex.css. */
export const MAR = "#F1F5EA", TINTA = "#20232B", NOITE = "#171A21", PAPEL = "#F1F5EA", VERMELHO = "#DC0A2D", AMARELO = "#FFCB05";

const lerDados = (nome) => JSON.parse(readFileSync(new URL(`../dados/${nome}`, import.meta.url), "utf8"));
export const POKEDEX = lerDados("pokedex.json");     // gerado por scripts/pokedex.mjs
export const FICHAS = lerDados("fichas.json");       // gerado por scripts/fichas.mjs
export const CARTAS = lerDados("cartas.json");       // gerado por scripts/cartas.mjs
export const COBBLEMON = lerDados("cobblemon.json"); // gerado por scripts/cobblemon.mjs
export const FORMAS_COM_ARTE = new Set(lerDados("formas-com-arte.json"));   // gerado por scripts/arte.mjs --formas
export const MAQUETES = lerDados("maquetes.json");                           // gerado por scripts/maquetes.mjs: estruturas e ambientes em blocos
export const ITENS_ARTE = lerDados("itens-arte.json");                       // gerado por scripts/itens-arte.mjs: posição de cada ícone no atlas
export const ENCONTROS = lerDados("encontros.json");                         // gerado por scripts/encontros.mjs: o que aparece em cada rota, por jogo
export const TIPOS_E_FATORES = lerDados("tipos.json");                       // gerado por scripts/tipos.mjs: efetividade dos 18 tipos
export const MODELOS = new Set(lerDados("modelos.json"));
export const MODELOS_3D = lerDados("modelos3d.json");                        // gerado por scripts/modelos.mjs --3d: quem gira no visor e quem tem shiny
/* Só entra no atlas o que o mod realmente traz nesta versão: estruturas que ele gera (as que não têm
 * peça inicial ficam sem maquete) e itens que têm textura ou modelo. O resto está nos arquivos de dados
 * e de tradução, mas não existe no jogo. */
COBBLEMON.estruturas = COBBLEMON.estruturas.filter((e) => MAQUETES.estruturas[e.id]);
COBBLEMON.itens = COBBLEMON.itens.filter((i) => i.id in ITENS_ARTE.itens || ITENS_ARTE.blocos.includes(i.id));                   // gerado por scripts/modelos.mjs: espécies desenhadas a partir do modelo do mod

export const ORDEM_TIPOS = ["Normal", "Fogo", "Água", "Planta", "Elétrico", "Gelo", "Lutador", "Venenoso", "Terrestre",
  "Voador", "Psíquico", "Inseto", "Pedra", "Fantasma", "Dragão", "Sombrio", "Aço", "Fada"];

export const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const semAcento = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/* O nome de um tipo na língua da página. (Nos dados e nos filtros o tipo é sempre o nome em português.) */
export const nomeDoTipo = (t) => (ingles() ? TIPOS_EN[t] : t);
/* O selo de um tipo, na cor dele (src/pokedex.css). */
export const selo = (t) => `<span class="tipo" data-tipo="${semAcento(t)}">${nomeDoTipo(t)}</span>`;

const EXTENSO = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze",
  "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte"];
const DEZENAS = { 20: "vinte", 30: "trinta", 40: "quarenta", 50: "cinquenta" };
export function extenso(n) {
  if (ingles()) return emIngles(n);
  if (n <= 20) return EXTENSO[n];
  const d = Math.floor(n / 10) * 10, u = n % 10;
  return DEZENAS[d] ? (u ? `${DEZENAS[d]} e ${EXTENSO[u]}` : DEZENAS[d]) : String(n);
}

/* "A, B e C" */
export const enumerar = (itens) => (itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} ${ingles() ? "and" : "e"} ${itens[itens.length - 1]}`);
/* 1025 -> "1.025"; 0.5 -> "0,5" */
export const numero = (n, casas = 0) => n.toLocaleString(ingles() ? "en-US" : "pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/* Endereço da página de uma espécie, em cada edição. */
export const enderecoEspecie = (id) => `/pokedex/${FICHAS[id].slug}/`;
export const enderecoCobblemon = (id) => `/cobblemon/pokemon/${FICHAS[id].slug}/`;
