/* Comparar: até três ilhas sobrepostas, nota por nota e ficha lado a lado. */
import { EIXOS, sementeDe } from "./relevo.js";
import { JOGOS } from "./dados.js";
import { ilhaViva } from "./ilha-viva.js";

const SERIES = [
  { id: "a", cor: "#1F7BA6", preenchimento: "rgba(31, 123, 166, 0.11)", tracejado: [] },
  { id: "b", cor: "#C4391F", preenchimento: "rgba(196, 57, 31, 0.1)", tracejado: [9, 5] },
  { id: "c", cor: "#6D4BA0", preenchimento: "rgba(109, 75, 160, 0.1)", tracejado: [2, 5] }
];
const PADRAO = { a: "red-blue-yellow", b: "scarlet-violet", c: "" };

const formulario = document.querySelector(".comparar-escolha");
const caixa = document.querySelector(".comparar-mapa .mapa-vivo");
const chave = document.querySelector("[data-chave]");
const hastes = document.querySelector("[data-hastes]");
const veredito = document.querySelector("[data-veredito]");
const tabela = document.querySelector("[data-tabela]");
const ilha = ilhaViva(caixa.querySelector("canvas"), { g: 90, mare: false, emergir: false });
caixa.classList.add("vivo");

const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const porSlug = (s) => JOGOS.find((j) => j.slug === s);
const lista = (itens) => itens.length <= 1 ? itens.join("") : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;

/* estado inicial: endereço, ou a dupla padrão */
const busca = new URLSearchParams(location.search);
for (const s of SERIES) {
  const pedido = busca.get(s.id);
  formulario.elements[s.id].value = pedido !== null && (porSlug(pedido) || (s.id === "c" && pedido === "")) ? pedido : PADRAO[s.id];
}

function escolhidos() {
  const vistos = new Set();
  return SERIES.map((s) => ({ serie: s, jogo: porSlug(formulario.elements[s.id].value) }))
    .filter((x) => x.jogo && !vistos.has(x.jogo.slug) && vistos.add(x.jogo.slug));
}

function desenharHastes(pares) {
  const escala = `<div class="haste-escala" aria-hidden="true"><span></span><div>${[1, 2, 3, 4, 5].map((n) => `<span style="left:${(n - 1) * 25}%">${n}</span>`).join("")}</div></div>`;
  const linhas = EIXOS.map((e, i) => {
    const marcas = [0, 25, 50, 75, 100].map((x) => `<span class="haste-marca" style="left:${x}%"></span>`).join("");
    const pontos = pares.map(({ serie, jogo }) => {
      const nota = jogo.valores[i];
      // notas iguais dividem a mesma posição: os pontos se afastam na vertical
      const iguais = pares.filter((p) => p.jogo.valores[i] === nota);
      const desvio = (iguais.findIndex((p) => p.jogo === jogo) - (iguais.length - 1) / 2) * 11;
      return `<span class="haste-ponto" data-serie="${serie.id}" style="--cor:${serie.cor};left:${(nota - 1) * 25}%;transform:translateY(${desvio}px)"></span>`;
    }).join("");
    const leitura = pares.map(({ jogo }) => `${jogo.curto} ${jogo.valores[i]}`).join("; ");
    return `<div class="haste"><span class="haste-eixo">${e.nome}</span><div class="haste-trilho" role="img" aria-label="${esc(e.nome)}: ${esc(leitura)}">${marcas}${pontos}</div></div>`;
  }).join("");
  hastes.innerHTML = escala + linhas;
}

function desenharVeredito(pares) {
  veredito.innerHTML = pares.map(({ serie, jogo }) => {
    const outros = pares.filter((p) => p.jogo !== jogo).map((p) => p.jogo);
    const lidera = EIXOS.map((e, i) => ({ e, i, folga: jogo.valores[i] - Math.max(...outros.map((o) => o.valores[i])) }))
      .filter((x) => x.folga >= 1)
      .sort((x, y) => y.folga - x.folga);
    const texto = lidera.length
      ? `Vai mais longe em ${lista(lidera.map((x) => `${x.e.nome.toLowerCase()} (${jogo.valores[x.i]} contra ${Math.max(...outros.map((o) => o.valores[x.i]))})`))}.`
      : `Não lidera sozinho em nenhuma direção: ${outros.length > 1 ? "os outros o alcançam ou superam" : "o outro o alcança ou supera"} em todas.`;
    return `<article class="veredito" style="--cor:${serie.cor}">
      <h3>${esc(jogo.curto)}</h3>
      <p>${texto} ${esc(jogo.chamada)}</p>
      <a href="/jogos/${jogo.slug}/">Ver a ilha de ${esc(jogo.curto)}</a>
    </article>`;
  }).join("");
}

function desenharTabela(pares) {
  const linhas = [
    ["Lançamento", (j) => j.ano],
    ["Console", (j) => esc(j.consoles)],
    ["Região ou cenário", (j) => esc(j.lugar ?? "Sem região")],
    ["Geração", (j) => j.geracao ?? "Fora da numeração"],
    ["Estilo", (j) => esc(j.estilo)],
    ["Categoria", (j) => esc(j.categoria)],
    ["Para quem", (j) => esc(j.paraQuem)]
  ];
  tabela.innerHTML = `<thead><tr><th scope="col"><span class="so-leitor">Atributo</span></th>${pares.map(({ serie, jogo }) => `<th scope="col"><span class="serie serie-${serie.id}"></span><a href="/jogos/${jogo.slug}/">${esc(jogo.curto)}</a></th>`).join("")}</tr></thead>
  <tbody>${linhas.map(([titulo, valor]) => `<tr><th scope="row">${titulo}</th>${pares.map(({ jogo }) => `<td>${valor(jogo)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}

function atualizar(gravar = true) {
  const pares = escolhidos();
  ilha.definir(pares.map(({ serie, jogo }) => ({
    valores: jogo.valores, semente: sementeDe(jogo.slug),
    cor: serie.cor, preenchimento: serie.preenchimento, tracejado: serie.tracejado
  })));
  chave.innerHTML = pares.map(({ serie, jogo }) => `<span><span class="serie serie-${serie.id}"></span>${esc(jogo.curto)}</span>`).join("");
  caixa.querySelector("canvas").setAttribute("aria-label", `Ilhas sobrepostas de ${lista(pares.map((p) => p.jogo.curto))}`);
  desenharHastes(pares);
  desenharVeredito(pares);
  desenharTabela(pares);

  const nova = new URLSearchParams();
  for (const s of SERIES) if (formulario.elements[s.id].value) nova.set(s.id, formulario.elements[s.id].value);
  if (gravar) history.replaceState(null, "", `?${nova}`);
}

formulario.addEventListener("change", () => atualizar());
formulario.addEventListener("submit", (e) => e.preventDefault());
atualizar(false);
