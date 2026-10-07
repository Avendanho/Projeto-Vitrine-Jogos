/* Biblioteca: filtros combináveis e busca por Pokémon, guardados no endereço da página. */
import { REDUZIDO } from "./ilha-viva.js";

const CHAVES = ["geracao", "regiao", "console", "estilo", "perfil"];
const itens = [...document.querySelectorAll(".arquipelago > li")];
const botoes = [...document.querySelectorAll("[data-filtro]")];
const contagem = document.querySelector("[data-contagem]");
const rotulo = document.querySelector("[data-contagem-rotulo]");
const limpar = document.querySelector("[data-limpar]");
const vazio = document.querySelector(".vazio");
const campo = document.querySelector("#busca-pokemon");
const sugestoes = document.querySelector("#lista-pokemon");
const resultado = document.querySelector("[data-busca-resultado]");

const semAcento = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
const estado = Object.fromEntries(CHAVES.map((c) => [c, ""]));
let especie = null;          // { id, nome, jogos: Set de slugs }
let indice = null;           // o módulo onde.js, carregado só quando alguém busca

const inicial = new URLSearchParams(location.search);
for (const c of CHAVES) {
  const v = inicial.get(c);
  if (v && botoes.some((b) => b.dataset.filtro === c && b.dataset.valor === v)) estado[c] = v;
}

async function carregarIndice() {
  if (!indice) {
    indice = await import("./onde.js");
    sugestoes.innerHTML = indice.NOMES.map(([, nome]) => `<option value="${nome.replace(/"/g, "&quot;")}">`).join("");
  }
  return indice;
}

function escolherEspecie(id) {
  const par = indice.NOMES.find(([n]) => n === id);
  if (!par) { especie = null; return; }
  const jogos = new Set(Object.entries(indice.POR_JOGO).filter(([, lista]) => lista.includes(id)).map(([slug]) => slug));
  especie = { id, nome: par[1], jogos };
}

function combina(li) {
  if (especie && !especie.jogos.has(li.dataset.slug)) return false;
  return CHAVES.every((c) => !estado[c] || (li.dataset[c] || "").split(" ").includes(estado[c]));
}

function aplicar() {
  let visiveis = 0;
  for (const li of itens) {
    const ok = combina(li);
    li.hidden = !ok;
    if (ok) visiveis++;
  }
  for (const b of botoes) b.setAttribute("aria-pressed", String(estado[b.dataset.filtro] === b.dataset.valor));
  const ativos = CHAVES.filter((c) => estado[c]);
  contagem.textContent = visiveis;
  rotulo.textContent = visiveis === 1 ? "ilha no mapa" : "ilhas no mapa";
  limpar.hidden = ativos.length === 0 && !especie;
  vazio.hidden = visiveis > 0;
  if (especie) {
    const n = especie.jogos.size;
    resultado.innerHTML = `<strong>${especie.nome}</strong> está na Pokédex de ${n} ${n === 1 ? "jogo" : "jogos"} do atlas. Derivados sem lista catalogada ficam de fora desta busca.`;
  } else if (!campo.value.trim()) {
    resultado.textContent = "";
  }

  const busca = new URLSearchParams();
  for (const c of ativos) busca.set(c, estado[c]);
  if (especie) busca.set("pokemon", especie.id);
  const texto = busca.toString();
  history.replaceState(null, "", texto ? `?${texto}` : location.pathname);
}

function mudar() {
  if (!document.startViewTransition || REDUZIDO) { aplicar(); return; }
  // uma transição nova interrompe a anterior, e isso não é erro
  const transicao = document.startViewTransition(aplicar);
  for (const promessa of [transicao.ready, transicao.finished, transicao.updateCallbackDone]) promessa.catch(() => {});
}

for (const b of botoes) {
  b.addEventListener("click", () => {
    const c = b.dataset.filtro;
    estado[c] = estado[c] === b.dataset.valor ? "" : b.dataset.valor;
    mudar();
  });
}
limpar.addEventListener("click", () => {
  for (const c of CHAVES) estado[c] = "";
  especie = null;
  campo.value = "";
  mudar();
});

/* a lista de nomes só é baixada quando o campo recebe atenção */
campo.addEventListener("focus", carregarIndice, { once: true });
async function buscar(final) {
  const texto = semAcento(campo.value);
  const antes = especie?.id ?? null;
  if (!texto) {
    especie = null;
  } else {
    const { NOMES } = await carregarIndice();
    const exato = NOMES.find(([, nome]) => semAcento(nome) === texto);
    // ao confirmar com Enter, vale o primeiro nome que começa com o que foi digitado
    const achado = exato || (final ? NOMES.find(([, nome]) => semAcento(nome).startsWith(texto)) : null);
    if (achado) {
      escolherEspecie(achado[0]);
      if (final) campo.value = achado[1];
    } else {
      especie = null;
      if (final) resultado.textContent = `Nenhum Pokémon chamado “${campo.value.trim()}”. Confira a grafia em inglês.`;
    }
  }
  if ((especie?.id ?? null) !== antes) mudar();
}
campo.addEventListener("input", () => buscar(false));
campo.addEventListener("change", () => buscar(true));
campo.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); buscar(true); } });

const pedido = Number(inicial.get("pokemon"));
if (pedido) {
  await carregarIndice();
  escolherEspecie(pedido);
  if (especie) campo.value = especie.nome;
}
aplicar();
