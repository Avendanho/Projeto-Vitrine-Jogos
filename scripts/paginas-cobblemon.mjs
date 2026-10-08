/* A edição Cobblemon do atlas: início, lista de Pokémon, página de cada espécie,
 * itens, estruturas e guia. Tudo sai de dados/cobblemon.json, que é extraído dos
 * arquivos do próprio mod; as curiosidades e os números são calculados aqui. */
import { MODELOS, MODELOS_3D, MAQUETES, ITENS_ARTE, COBBLEMON, FICHAS, ORDEM_TIPOS, esc, semAcento, numero, extenso, maiuscula, enumerar, enderecoEspecie, enderecoCobblemon } from "./base.mjs";
import { moldura } from "./paginas.mjs";

const C = COBBLEMON;
const ESPECIES = Object.values(C.especies).sort((a, b) => a.n - b.n);
const NO_MOD = ESPECIES.filter((e) => e.impl);
const n4 = (n) => String(n).padStart(4, "0");
const RARIDADES = { common: "Comum", uncommon: "Incomum", rare: "Raro", "ultra-rare": "Ultrarraro" };
const AMBIENTE = Object.fromEntries(C.ambientes.map((a) => [a.id, a.nome]));
const nasce = (e) => e.spawns.length > 0 || e.bandos.length > 0;
const montavel = (e) => e.montaria.length > 0;
const base = { edicao: "cobblemon" };
export const FUNDO_COBBLEMON = "#DCCB9F", TINTA_COBBLEMON = "#231F1A";
const DIA = `data-fundo="${FUNDO_COBBLEMON}" data-tinta="${TINTA_COBBLEMON}"`;

/* ---------- peças ---------- */

/* O Pokémon dentro de um "slot" de inventário. Quem já tem modelo no mod aparece em tinta de mapa,
 * e o navegador troca pela cor do modelo quando alguém aponta (src/js/base.js). Quem ainda não
 * está no mod fica com o desenho em pixel da arte oficial. */
export function slot(n, { ligacao = true, lado = 96, preguica = true } = {}) {
  const e = C.especies[n], vivo = MODELOS.has(n);
  const espera = preguica ? ' loading="lazy" decoding="async"' : "";
  const figura = vivo
    ? `<img class="tinta" src="/arte/modelo/${n}-tinta.png" data-cor="/arte/modelo/${n}.webp" alt="" width="${lado}" height="${lado}"${espera}>`
    : `<img class="pixel" src="/arte/pixel/${n}.png" alt="" width="${lado}" height="${lado}"${espera}>`;
  const marca = vivo ? ` data-n="${n}"` : "";
  return ligacao && e.impl
    ? `<a class="slot"${marca} href="${enderecoCobblemon(n)}" title="${esc(e.nome)}" aria-label="${esc(e.nome)}">${figura}</a>`
    : `<span class="slot"${marca} title="${esc(e.nome)}">${figura}</span>`;
}
/* O ícone de um item, recortado do atlas src/arte/itens.png. Com o ponteiro em cima ele gira, como item largado no chão. */
function icone(id) {
  const i = ITENS_ARTE.itens[id];
  return i === undefined          // os que são blocos com modelo próprio vêm desenhados em 3D, cada um no seu arquivo
    ? `<span class="slot slot-item" aria-hidden="true"><img class="item-bloco" src="/arte/item/${id}.png" alt="" width="48" height="48" loading="lazy" decoding="async"></span>`
    : `<span class="slot slot-item" aria-hidden="true"><span class="item-icone" style="--cx:${i % ITENS_ARTE.colunas};--cy:${Math.floor(i / ITENS_ARTE.colunas)}"></span></span>`;
}
/* A receita como aparece na bancada do jogo: grade 3×3, seta e o que sai. Item do mod usa o ícone dele;
 * ingrediente do Minecraft vem em tinta de mapa (src/arte/ingredientes.png). O nome de cada casa fica na dica. */
function casaDaBancada(c) {
  if (!c) return `<span class="slot bancada-casa"></span>`;
  const [id, rotulo] = c, [espaco, nome] = id.split(":"), i = espaco === "cobblemon" ? ITENS_ARTE.itens[nome] : undefined, k = ITENS_ARTE.ingredientes[id];
  const figura = i !== undefined ? `<span class="item-icone" style="--cx:${i % ITENS_ARTE.colunas};--cy:${Math.floor(i / ITENS_ARTE.colunas)}"></span>`
    : espaco === "cobblemon" && ITENS_ARTE.blocos.includes(nome) ? `<img class="item-bloco" src="/arte/item/${nome}.png" alt="" width="32" height="32" loading="lazy" decoding="async">`
    : k !== undefined ? `<span class="ing-icone" style="--cx:${k % ITENS_ARTE.colunasDeIngredientes};--cy:${Math.floor(k / ITENS_ARTE.colunasDeIngredientes)}"></span>`
    : `<span class="bancada-letra">${esc(rotulo[0])}</span>`;
  return `<span class="slot bancada-casa" title="${esc(rotulo)}">${figura}</span>`;
}
function bancada(item) {
  const r = item.receita;
  if (!r?.grade) return "";
  return `<span class="bancada" role="img" aria-label="Receita de bancada${r.forma === "livre" ? ", em qualquer posição" : ""}: ${esc(enumerar(r.ingredientes))}${r.rende > 1 ? `. Rende ${r.rende}` : ""}">
    <span class="bancada-grade">${r.grade.map(casaDaBancada).join("")}</span><span class="bancada-seta"></span><span class="bancada-saida">${icone(item.id)}${r.rende > 1 ? `<span class="bancada-rende">${r.rende}</span>` : ""}</span>${r.forma === "livre" ? '<span class="bancada-nota">em qualquer posição</span>' : ""}
  </span>`;
}
/* Uma maquete de blocos: a imagem parada e o botão que a troca pelo modelo que gira (src/js/maquete.js). */
function maquete(info, legenda, { auto = false, preguica = true } = {}) {
  return `<figure class="maquete"${auto ? " data-maquete-auto" : ""} data-maquete="/maquetes/${info.nome}.json">
    <img src="/arte/maquete/${info.nome}.webp" alt="${esc(legenda)}" width="480" height="480"${preguica ? ' loading="lazy" decoding="async"' : ""}>
    <button type="button" class="maquete-girar">Girar em 3D</button>
    <span class="maquete-dica" aria-hidden="true">Arraste para girar, role para aproximar</span>
  </figure>`;
}
/* Em que ambiente do atlas cai cada estrutura, pelo nome do bioma em que o mod a gera. */
const PISTAS = [
  ["caverna", /caverna/], ["oceano", /ocean|prai|litoral/], ["frio", /neva|gelo|congel|tundra|glacia/], ["arido", /areia|árid|ermo|savana|desert/],
  ["agua-doce", /pântano|lama|rio|água doce/], ["selva", /selva|bambu|tropic|ilha/], ["floresta", /taiga|florest|bosque|cogumelo|cerej/],
  ["montanha", /terras altas|montanh|colina|pico|céu/], ["campo", /planíc|pradaria|temperad|florid|mágic/]
];
const ambienteDoBioma = (nome) => C.biomas.find((b) => b.nome === nome)?.ambiente ?? PISTAS.find(([, r]) => r.test(nome.toLowerCase()))?.[0];
const ambientesDaEstrutura = (e) => [...new Set(e.biomas.map(ambienteDoBioma).filter(Boolean))];
const ancora = (e) => e.id.split(":").pop().replace(/\//g, "-");

const fileira = (ns, limite = 18) => `<span class="fileira">${ns.slice(0, limite).map((n) => slot(n, { lado: 48 })).join("")}${ns.length > limite ? `<span class="fileira-resto">e mais ${ns.length - limite}</span>` : ""}</span>`;

const mais = (lista, chave) => { const m = new Map(); for (const x of lista) for (const k of [].concat(chave(x))) m.set(k, (m.get(k) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };

/* ---------- números e curiosidades, calculados dos dados ---------- */

const linhasDe = (e) => e.spawns;
const soSe = (teste) => NO_MOD.filter((e) => e.spawns.length && e.spawns.every(teste));
const POR_AMBIENTE = Object.fromEntries(C.ambientes.map((a) => [a.id, NO_MOD.filter((e) => e.ambientes.includes(a.id))]));
/* Quem deixa cair cada item: o avesso das quedas de cada espécie, pelo nome do item em português. */
export function quemDeixa() {
  const mapa = new Map();
  for (const e of NO_MOD) for (const [nome] of e.drops) { if (!mapa.has(nome)) mapa.set(nome, []); mapa.get(nome).push(e.n); }
  return mapa;
}
const QUEDAS = mais(NO_MOD.flatMap((e) => e.drops.map((d) => d[0])), (x) => x);
const TROCAS = NO_MOD.filter((e) => e.evolui.some((v) => v.como.startsWith("por troca"))).length;
const NUMEROS = {
  total: ESPECIES.length, noMod: NO_MOD.length, faltam: ESPECIES.length - NO_MOD.length,
  nascem: NO_MOD.filter(nasce).length, montarias: NO_MOD.filter(montavel).length, ombro: NO_MOD.filter((e) => e.ombro).length,
  alfas: NO_MOD.filter((e) => e.alfa).length, bandos: NO_MOD.filter((e) => e.bando).length,
  itens: C.itens.length, bolas: C.itens.filter((i) => i.grupo === "bolas").length, estruturas: C.estruturas.length, fosseis: C.fosseis.length
};

function curiosidades() {
  const fatos = [];
  const [maior] = Object.entries(POR_AMBIENTE).sort((a, b) => b[1].length - a[1].length);
  fatos.push(`O ambiente com mais espécies é ${AMBIENTE[maior[0]].toLowerCase()}: ${maior[1].length} das ${NUMEROS.noMod} que estão no mod aparecem ali.`);
  const noite = soSe((l) => l.h === "à noite"), dia = soSe((l) => l.h === "de dia");
  fatos.push(`${maiuscula(extenso(noite.length))} espécies só nascem à noite, como ${enumerar(noite.slice(0, 3).map((e) => e.nome))}. Outras ${dia.length} só de dia.`);
  const chuva = soSe((l) => l.q.includes("com chuva") || l.q.includes("com trovoada"));
  if (chuva.length) fatos.push(`${chuva.length === 1 ? "Uma espécie só aparece" : `${maiuscula(chuva.length === 2 ? "duas" : extenso(chuva.length))} espécies só aparecem`} com chuva ou trovoada: ${enumerar(chuva.slice(0, 4).map((e) => e.nome))}${chuva.length > 4 ? " e outras" : ""}.`);
  const lua = NO_MOD.filter((e) => e.spawns.some((l) => l.q.some((f) => f.includes("lua"))));
  if (lua.length) fatos.push(`A fase da lua importa para ${lua.length} espécies, entre elas ${enumerar(lua.slice(0, 3).map((e) => e.nome))}.`);
  const pesca = soSe((l) => l.c.length === 1 && l.c[0] === "fishing");
  if (pesca.length) fatos.push(`${maiuscula(extenso(pesca.length))} espécies só existem na ponta da Pokévara: não nascem soltas, só pescando.`);
  const vilas = C.estruturasDoJogo.find((e) => e.nome === "vilas");
  if (vilas) fatos.push(`${vilas.especies.length} espécies têm regra própria para nascer em vilas.`);
  const [campea] = [...NO_MOD].sort((a, b) => b.spawns.length - a.spawns.length);
  fatos.push(`${campea.nome} é a espécie com mais jeitos de nascer: ${campea.spawns.length} combinações diferentes de lugar e condição.`);
  fatos.push(`O item que mais Pokémon deixam cair é ${QUEDAS[0][0]}, em ${QUEDAS[0][1]} espécies. Depois vêm ${QUEDAS[1][0]} e ${QUEDAS[2][0]}.`);
  fatos.push(`${NUMEROS.alfas} espécies podem aparecer como alfa, à frente de um bando.`);
  fatos.push(`No Fim nascem ${POR_AMBIENTE.fim.length} espécies; no Nether, ${POR_AMBIENTE.nether.length}.`);
  const semNascer = NO_MOD.filter((e) => !nasce(e));
  fatos.push(`${semNascer.length} espécies estão no mod mas não nascem no mundo, como ${enumerar(semNascer.slice(0, 3).map((e) => e.nome))}: chegam por evolução, fóssil ou outros meios.`);
  return fatos;
}

/* ---------- início ---------- */

/* Para cada ambiente, as espécies mais fáceis de encontrar ali (as comuns primeiro). */
function vitrine(ambiente, quantas = 6) {
  const peso = (e) => ({ common: 0, uncommon: 1, rare: 2, "ultra-rare": 3 }[e.raridade] ?? 4);
  const lista = [...POR_AMBIENTE[ambiente]].filter((e) => e.spawns.length).sort((a, b) => peso(a) - peso(b) || a.ambientes.length - b.ambientes.length || a.n - b.n);
  // espalha pela Pokédex em vez de mostrar seis vizinhos
  const passo = Math.max(1, Math.floor(Math.min(lista.length, 40) / quantas));
  return Array.from({ length: Math.min(quantas, lista.length) }, (_, i) => lista[i * passo]);
}

export function paginaCobblemonInicio() {
  const corpo = `
<section class="cb-abertura" ${DIA} aria-labelledby="t-abertura">
  <canvas class="cb-mapa" data-mapa="explorar" aria-hidden="true"></canvas>
  <span class="cb-marcador" aria-hidden="true"></span>
  <div class="cb-abertura-texto">
    <h1 id="t-abertura">Cobblemon</h1>
    <p class="cb-lema" data-entra="palavras" data-ritmo="1000">O mesmo atlas, agora em blocos.</p>
  </div>
  <p class="cb-abertura-nota">Dados da versão ${esc(C.versao)} do mod. O mapa se revela por onde o marcador anda; no computador, ele segue o cursor.</p>
</section>

<section class="cb-numeros" ${DIA} aria-labelledby="t-numeros">
  <div class="cb-numeros-texto">
    <h2 id="t-numeros">Um mod inteiro, lido arquivo por arquivo</h2>
    <p class="prosa">Tudo o que esta edição mostra saiu dos arquivos do próprio Cobblemon: quais espécies já estão no jogo, em que bioma cada uma nasce, o que deixa cair, o que se fabrica e o que se encontra pelo mundo.</p>
  </div>
  <dl class="numeros">
    <div><dd data-entra="contar" data-ate="${NUMEROS.noMod}">${NUMEROS.noMod}</dd><dt>espécies no mod, de ${numero(NUMEROS.total)}</dt></div>
    <div><dd data-entra="contar" data-ate="${NUMEROS.montarias}">${NUMEROS.montarias}</dd><dt>que dá para montar</dt></div>
    <div><dd data-entra="contar" data-ate="${NUMEROS.itens}">${NUMEROS.itens}</dd><dt>itens e blocos</dt></div>
    <div><dd data-entra="contar" data-ate="${NUMEROS.estruturas}">${NUMEROS.estruturas}</dd><dt>estruturas no mundo</dt></div>
  </dl>
</section>

<section class="cb-pico" data-cena data-telas="${C.ambientes.length * 0.75 + 1}" data-fundo="#2B2620" data-tinta="#EFE6CF" aria-labelledby="t-pico">
  <div class="palco">
    <div class="cb-pico-mapa" aria-hidden="true"><canvas class="cb-mapa" data-mapa="ambientes"></canvas></div>
    <div class="cb-pico-texto">
      <h2 id="t-pico">O que nasce em cada lugar</h2>
      <ol class="cb-ambientes">
        ${C.ambientes.map((a) => `<li data-ambiente="${a.id}">
          <h3>${esc(a.nome)}</h3>
          <p>${POR_AMBIENTE[a.id].length} espécies nascem aqui.</p>
          <span class="fileira">${vitrine(a.id).map((e) => slot(e.n, { lado: 64 })).join("")}</span>
          <a class="ligacao" href="/cobblemon/pokemon/?ambiente=${a.id}">Ver todas</a>
        </li>`).join("\n        ")}
      </ol>
    </div>
  </div>
</section>

<section class="cb-portas" ${DIA} aria-labelledby="t-portas">
  <h2 id="t-portas">O resto do inventário</h2>
  <ul class="cb-portas-lista">
    <li class="painel"><a href="/cobblemon/pokemon/"><span class="fileira">${[25, 194, 448, 94].map((n) => slot(n, { ligacao: false, lado: 64 })).join("")}</span><h3>Pokémon</h3><p>${NUMEROS.noMod} espécies, com onde nascem, o que deixam cair e como evoluem no mod.</p></a></li>
    <li class="painel"><a href="/cobblemon/itens/"><h3>Itens</h3><p>${NUMEROS.itens} itens e blocos em português, das ${NUMEROS.bolas} Poké Bolas às bagas, com as receitas de bancada.</p></a></li>
    <li class="painel"><a href="/cobblemon/estruturas/"><h3>Estruturas</h3><p>${NUMEROS.estruturas} habitats, ruínas e naufrágios, com o bioma de cada um e o que nasce ali.</p></a></li>
    <li class="painel"><a href="/cobblemon/biomas/"><h3>Biomas</h3><p>Os ${C.ambientes.length} ambientes em maquetes que giram, com as estruturas de cada um, e como o mod decide o que nasce.</p></a></li>
  </ul>
</section>

<section class="cb-fechamento" ${DIA} aria-labelledby="t-fechamento">
  <h2 id="t-fechamento" data-entra="palavras" data-ritmo="1200">Mundo novo, regra nova.</h2>
  <p class="prosa">O Cobblemon não tem Liga nem créditos. Os desafios dão um motivo para começar de novo.</p>
  <a class="botao botao-grande" href="/cobblemon/desafios/#roleta">Sortear um desafio</a>
</section>`;

  return moldura({
    ...base, titulo: "Cobblemon no PokéAtlas", caminho: "/cobblemon/", classe: "pagina-cb-inicio", corpo, modulo: "cobblemon-inicio", rolagem: true, espelho: "/",
    descricao: `O atlas do Cobblemon ${C.versao}: ${NUMEROS.noMod} Pokémon com o bioma em que nascem, ${NUMEROS.itens} itens, ${NUMEROS.estruturas} estruturas e desafios para jogar de outro jeito.`
  });
}

/* ---------- lista de Pokémon ---------- */

export function paginaCobblemonPokemon() {
  const item = (e) => `<li data-n="${e.n}" data-nome="${esc(semAcento(e.nome))}" data-tipos="${e.tipos.map(semAcento).join(" ")}" data-ambientes="${e.ambientes.join(" ")}" data-raridade="${e.raridade ?? ""}"${montavel(e) ? " data-monta" : ""}><a href="${enderecoCobblemon(e.n)}">${slot(e.n, { ligacao: false })}<span class="dex-numero">${n4(e.n)}</span><span class="dex-nome">${esc(e.nome)}</span><span class="dex-tipos">${e.tipos.join(", ")}</span></a></li>`;
  const corpo = `
<section class="cabecalho">
  <h1>Pokémon</h1>
  <p class="prosa">As ${NUMEROS.noMod} espécies que já estão no Cobblemon ${esc(C.versao)}, desenhadas a partir dos modelos do próprio mod. Elas começam em tinta de mapa: aponte para uma e ela aparece como no jogo. Abra a página dela e ela fica revelada de vez, com o bioma em que nasce, a raridade, o que deixa cair e como evolui.</p>
  <p class="cb-vistos" data-vistos hidden>Seu mapa: <strong data-vistos-contagem>0</strong> de ${NUMEROS.noMod} espécies reveladas. <button type="button" class="ligacao" data-vistos-apagar>Apagar o mapa</button></p>
</section>
<section class="pokedex-geral" data-cb-lista>
  <form class="dex-controles" role="search" aria-label="Procurar Pokémon do Cobblemon">
    <div class="dex-busca">
      <label for="dex-procurar">Procurar</label>
      <input id="dex-procurar" name="q" type="search" placeholder="Nome ou número" autocomplete="off" spellcheck="false">
    </div>
    <div class="filtro-opcoes" role="group" aria-label="Onde nasce">${C.ambientes.map((a) => `<button type="button" class="ficha" data-filtro="ambiente" data-valor="${a.id}" aria-pressed="false">${esc(a.nome)}</button>`).join("")}</div>
    <div class="filtro-opcoes" role="group" aria-label="Raridade">${Object.entries(RARIDADES).map(([id, nome]) => `<button type="button" class="ficha" data-filtro="raridade" data-valor="${id}" aria-pressed="false">${nome}</button>`).join("")}<button type="button" class="ficha" data-filtro="monta" data-valor="1" aria-pressed="false">Dá para montar</button></div>
    <div class="filtro-opcoes" role="group" aria-label="Tipo">${ORDEM_TIPOS.map((t) => `<button type="button" class="ficha ficha-tipo" data-filtro="tipo" data-valor="${semAcento(t)}" aria-pressed="false">${t}</button>`).join("")}</div>
    <p class="dex-resumo"><span aria-live="polite"><strong data-dex-contagem>${NUMEROS.noMod}</strong> <span data-dex-rotulo>espécies</span></span> <button type="button" class="ligacao" data-dex-limpar hidden>Limpar</button></p>
  </form>
  <ol class="gaveta gaveta-cb">
    ${NO_MOD.map(item).join("")}
  </ol>
  <p class="vazio" data-dex-vazio hidden>Nenhuma espécie com essa combinação. Tire um filtro ou confira a grafia em inglês.</p>
</section>`;
  return moldura({
    ...base, titulo: "Pokémon do Cobblemon", caminho: "/cobblemon/pokemon/", classe: "pagina-cb-lista", corpo, modulo: "cobblemon-lista", espelho: "/pokedex/",
    descricao: `As ${NUMEROS.noMod} espécies do Cobblemon ${C.versao}, filtráveis por bioma, raridade e tipo, com onde cada uma nasce.`
  });
}

/* ---------- a página de uma espécie ---------- */

const CONTEXTO = C.contextos;
const nivel = ([a, b]) => (a === b ? `Nível ${a}` : `Nível ${a} a ${b}`);
function linhaDeSpawn(l) {
  const quando = [l.h, ...l.q].filter(Boolean);
  return `<tr>
      <td><span class="raridade raridade-${l.b}">${RARIDADES[l.b]}</span>${l.f ? `<span class="cb-forma">forma de ${esc(l.f)}</span>` : ""}</td>
      <td>${esc(enumerar(l.bi))}</td>
      <td>${esc(enumerar(l.c.map((c) => CONTEXTO[c] ?? c)).replace(/, ([A-Z])/g, (_, x) => `, ${x.toLowerCase()}`).replace(/ e ([A-Z])/g, (_, x) => ` e ${x.toLowerCase()}`))}</td>
      <td>${nivel(l.n)}</td>
      <td>${quando.length ? esc(maiuscula(quando.join("; "))) : "A qualquer hora"}</td>
    </tr>`;
}
function tabelaDeSpawn(linhas) {
  return `<div class="tabela-rolagem"><table class="cb-tabela">
    <thead><tr><th scope="col">Raridade</th><th scope="col">Onde</th><th scope="col">Como</th><th scope="col">Nível</th><th scope="col">Condições</th></tr></thead>
    <tbody>${linhas.map(linhaDeSpawn).join("")}</tbody>
  </table></div>`;
}

const origemDe = {};                              // espécie -> de quem evolui, e como
for (const e of ESPECIES) for (const v of e.evolui) (origemDe[v.n] ??= []).push({ de: e.n, forma: v.forma, como: v.como });
const fossilDe = Object.fromEntries(C.fosseis.map((f) => [f.n, f.fosseis]));

export function paginaCobblemonEspecie(n) {
  const e = C.especies[n];
  const i = NO_MOD.indexOf(e), anterior = NO_MOD[i - 1], proxima = NO_MOD[i + 1];
  const principais = e.spawns.slice(0, 8), resto = e.spawns.slice(8);
  const fatos = [];
  if (montavel(e)) fatos.push(`Dá para montar: anda ${enumerar(e.montaria)}${e.assentos > 1 ? `, e leva ${extenso(e.assentos)} pessoas` : ""}.`);
  if (e.ombro) fatos.push("É pequeno o bastante para andar no seu ombro.");
  if (e.bando) fatos.push("Pode aparecer em bando.");
  if (e.alfa) fatos.push("Pode aparecer como alfa, à frente de um bando.");
  if (fossilDe[n]) fatos.push(`É revivido na máquina de fósseis, a partir de ${enumerar(fossilDe[n])}.`);
  for (const o of origemDe[n] || []) fatos.push(`Evolui de <a href="${enderecoCobblemon(o.de)}">${esc(C.especies[o.de].nome)}</a>${o.forma ? `, na forma de ${esc(o.forma)}` : ""}: ${esc(o.como)}.`);
  for (const v of e.evolui) {
    const alvo = C.especies[v.n];
    fatos.push(`Evolui para ${alvo.impl ? `<a href="${enderecoCobblemon(v.n)}">${esc(alvo.nome)}</a>` : esc(alvo.nome)}${v.forma ? `, na forma de ${esc(v.forma)}` : ""}: ${esc(v.como)}.`);
  }

  const corpo = `
<article class="especie cb-especie">
  <section class="especie-topo">
    <div class="especie-texto">
      <p class="migalha"><a href="/cobblemon/pokemon/">Pokémon do Cobblemon</a></p>
      <p class="especie-numero">Nº ${n4(n)}</p>
      <h1>${esc(e.nome)}</h1>
      <ul class="especie-tipos" aria-label="Tipos e classificação">${e.tipos.map((t) => `<li><a class="ficha" href="/cobblemon/pokemon/?tipo=${semAcento(t)}">${t}</a></li>`).join("")}${e.rotulos.map((r) => `<li><span class="ficha ficha-rotulo">${r}</span></li>`).join("")}</ul>
      ${e.desc ? `<p class="cb-descricao">${esc(e.desc)}</p>` : ""}
      ${e.spawns.length ? `<p class="cb-cacar"><button type="button" class="botao botao-contorno botao-pequeno" data-cacar="${n}" hidden>Pôr na caçada</button> <a class="ligacao" href="/cobblemon/cacada/" data-cacada-link hidden>Ver o plano de caçada</a></p>` : ""}
    </div>
    ${MODELOS.has(n)
      ? `<figure class="cb-retrato painel" data-retrato="${n}"${MODELOS_3D.modelos.includes(n) ? ` data-modelo3d="/modelos3d/${n}.json" data-textura="/modelos3d/${n}.png"${MODELOS_3D.shiny.includes(n) ? ` data-shiny="/modelos3d/${n}-shiny.png"` : ""}` : ""}>
      <img class="cb-modelo" src="/arte/modelo/${n}.webp" alt="${esc(e.nome)}, o modelo do Cobblemon" width="400" height="400">
      <canvas class="cb-revela" width="400" height="400" data-tinta="/arte/modelo/${n}-tinta.png" aria-hidden="true"></canvas>
      ${MODELOS_3D.modelos.includes(n) ? `<button type="button" class="maquete-girar">Girar em 3D</button>${MODELOS_3D.shiny.includes(n) ? '<button type="button" class="modelo-shiny" data-shiny-botao aria-pressed="false">Shiny</button>' : ""}<span class="maquete-dica" aria-hidden="true">Arraste para girar, role para aproximar</span>` : ""}
    </figure>`
      : `<figure class="cb-retrato painel"><img class="pixel" src="/arte/pixel/${n}.png" alt="${esc(e.nome)}, em pixel" width="288" height="288"></figure>`}
  </section>

  <section aria-labelledby="t-onde">
    <h2 id="t-onde">Onde nasce</h2>
    ${e.spawns.length ? `<p class="nota-editorial">Resumo das regras de spawn do mod. Cada linha é uma combinação de lugar e condição em que ${esc(e.nome)} pode aparecer.</p>
    ${tabelaDeSpawn(principais)}
    ${resto.length ? `<details class="cb-mais"><summary>Ver as outras ${resto.length} combinações</summary>${tabelaDeSpawn(resto)}</details>` : ""}` : ""}
    ${e.bandos.length ? `<ul class="lista-marcada cb-bandos">${e.bandos.map((b) => `<li>${b.b === "alfa" ? "Como alfa de um bando" : `Em bando, ${RARIDADES[b.b].toLowerCase()}`}: ${esc(enumerar(b.bi))}.</li>`).join("")}</ul>` : ""}
    ${!nasce(e) ? `<p class="prosa">Não nasce no mundo. No mod, ${esc(e.nome)} chega por outros meios, como evolução, fóssil ou evento.</p>` : ""}
  </section>

  ${e.drops.length ? `<section aria-labelledby="t-quedas">
    <h2 id="t-quedas">O que deixa cair</h2>
    <ul class="cb-quedas">${e.drops.map(([nome, quanto]) => `<li><span>${esc(nome)}</span><span>${esc(quanto)}</span></li>`).join("")}</ul>
  </section>` : ""}

  ${fatos.length ? `<section aria-labelledby="t-mod">
    <h2 id="t-mod">No mod</h2>
    <ul class="lista-marcada cb-fatos">${fatos.map((f) => `<li>${f}</li>`).join("")}</ul>
  </section>` : ""}

  <section class="cb-ponte painel">
    <p>Atributos, formas especiais, linha evolutiva completa e os jogos em que ${esc(e.nome)} aparece estão na outra edição do atlas.</p>
    <a class="botao botao-contorno" href="${enderecoEspecie(n)}">Ver ${esc(e.nome)} na Pokédex</a>
  </section>

  <nav class="jogo-passos" aria-label="Espécies vizinhas">
    ${anterior ? `<a href="${enderecoCobblemon(anterior.n)}"><span>Nº ${n4(anterior.n)}</span>${esc(anterior.nome)}</a>` : "<span></span>"}
    ${proxima ? `<a href="${enderecoCobblemon(proxima.n)}"><span>Nº ${n4(proxima.n)}</span>${esc(proxima.nome)}</a>` : "<span></span>"}
  </nav>
</article>`;

  const onde = e.ambientes.filter((a) => a !== "qualquer").map((a) => AMBIENTE[a].toLowerCase());
  return moldura({
    ...base, titulo: `${e.nome} no Cobblemon`, caminho: enderecoCobblemon(n), classe: "pagina-cb-especie", corpo, modulo: "cobblemon-especie", extra: "modelo3d", espelho: enderecoEspecie(n),
    descricao: `${e.nome} no Cobblemon ${C.versao}: ${nasce(e) ? `nasce em ${onde.length ? enumerar(onde.slice(0, 3)) : "qualquer bioma da Superfície"}` : "não nasce no mundo"}. Veja raridade, condições, o que deixa cair e como evolui no mod.`
  });
}
export const ESPECIES_DO_COBBLEMON = NO_MOD.map((e) => e.n);
export const estaNoCobblemon = (n) => Boolean(C.especies[n]?.impl);

/* ---------- itens ---------- */

export function paginaCobblemonItens() {
  const NOTAS = {
    bolas: "A dica de cada bola é a do próprio jogo: o multiplicador de captura e quando ele vale. As receitas são as de bancada.",
    varas: `O mod tem ${C.contagens.varas} Pokévaras, uma para cada tipo de Poké Bola; a tradução só dá nome próprio à primeira.`,
    bagas: `São ${C.contagens.bagas} bagas, cada uma com o seu tempo de crescimento.`
  };
  const grupos = C.grupos.map((g) => ({ ...g, itens: C.itens.filter((i) => i.grupo === g.id) })).filter((g) => g.itens.length);
  const deixam = quemDeixa(), doMod = new Set(C.itens.map((i) => i.nome));
  const nomes = (ns) => semAcento(ns.map((n) => C.especies[n].nome).join(" "));
  const deixado = (ns) => `<span class="cb-deixado"><span class="cb-deixado-rotulo">Deixado por ${ns.length === 1 ? "uma espécie" : `${ns.length} espécies`}</span>${fileira(ns, 10)}</span>`;
  const doJogo = [...deixam].filter(([nome]) => !doMod.has(nome)).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  const corpo = `
<section class="cabecalho">
  <h1>Itens</h1>
  <p class="prosa">${NUMEROS.itens} itens e blocos do Cobblemon ${esc(C.versao)}, com o ícone, o nome e a descrição do próprio mod. Onde há receita, ela vem desenhada como na bancada do jogo; passe o ponteiro numa casa para ver o nome do ingrediente. Cada item mostra também os Pokémon que o deixam cair, e a busca acha por eles. Aponte para um item e ele gira, como quando cai no chão.</p>
</section>
<section class="cb-itens" data-cb-itens>
  <form class="dex-controles" role="search" aria-label="Procurar item">
    <div class="dex-busca">
      <label for="item-procurar">Procurar item</label>
      <input id="item-procurar" type="search" placeholder="Nome, efeito ou Pokémon que deixa cair" autocomplete="off" spellcheck="false">
    </div>
    <nav class="filtro-opcoes" aria-label="Grupos">${grupos.map((g) => `<a class="ficha" href="#g-${g.id}">${esc(g.nome)} <span class="dex-conta">${g.itens.length}</span></a>`).join("")}<a class="ficha" href="#g-minecraft">Do Minecraft <span class="dex-conta">${doJogo.length}</span></a></nav>
    <p class="dex-resumo" aria-live="polite"><strong data-dex-contagem>${NUMEROS.itens}</strong> <span data-dex-rotulo>itens</span></p>
  </form>
  ${grupos.map((g) => `<section class="cb-grupo" id="g-${g.id}" aria-labelledby="t-${g.id}">
    <h2 id="t-${g.id}">${esc(g.nome)}</h2>
    ${NOTAS[g.id] ? `<p class="nota-editorial">${NOTAS[g.id]}</p>` : ""}
    <ul class="cb-itens-lista">
      ${g.itens.map((i) => `<li data-busca="${esc(semAcento(`${i.nome} ${i.dica ?? ""}`))}${deixam.has(i.nome) ? ` ${esc(nomes(deixam.get(i.nome)))}` : ""}">${icone(i.id)}<div class="cb-item-texto"><strong>${esc(i.nome)}</strong>${i.dica ? `<span>${esc(i.dica)}</span>` : ""}${i.receita ? `<span class="cb-receita">Feito com ${esc(enumerar(i.receita.ingredientes))}.${i.receita.rende > 1 ? ` Rende ${i.receita.rende}.` : ""}</span>${bancada(i)}` : ""}${deixam.has(i.nome) ? deixado(deixam.get(i.nome)) : ""}</div></li>`).join("\n      ")}
    </ul>
  </section>`).join("\n  ")}
  <section class="cb-grupo cb-grupo-jogo" id="g-minecraft" aria-labelledby="t-minecraft">
    <h2 id="t-minecraft">Itens do Minecraft que os Pokémon deixam cair</h2>
    <p class="nota-editorial">Não são itens do mod, mas saem dos Pokémon dele. Servem para saber quem procurar quando falta pena, osso ou pólvora.</p>
    <ul class="cb-itens-lista">
      ${doJogo.map(([nome, ns]) => `<li data-fora data-busca="${esc(semAcento(nome))} ${esc(nomes(ns))}"><div class="cb-item-texto"><strong>${esc(nome)}</strong>${deixado(ns)}</div></li>`).join("\n      ")}
    </ul>
  </section>
  <p class="vazio" data-dex-vazio hidden>Nenhum item com esse nome ou efeito.</p>
</section>`;
  return moldura({
    ...base, titulo: "Itens do Cobblemon", caminho: "/cobblemon/itens/", classe: "pagina-cb-itens", corpo, modulo: "cobblemon-itens",
    descricao: `Os ${NUMEROS.itens} itens do Cobblemon ${C.versao} em português: Poké Bolas com receita, bagas, itens de evolução, itens segurados, fósseis e mais.`
  });
}

/* ---------- estruturas ---------- */

export function paginaCobblemonEstruturas() {
  const familias = C.familias.map((f) => ({ ...f, itens: C.estruturas.filter((e) => e.familia === f.id) })).filter((f) => f.itens.length);
  const semNomeOficial = C.estruturas.filter((e) => !e.oficial).length;
  const corpo = `
<section class="cabecalho">
  <h1>Estruturas</h1>
  <p class="prosa">O Cobblemon ${esc(C.versao)} espalha ${NUMEROS.estruturas} estruturas próprias pelo mundo. Cada uma aparece aqui em maquete de blocos, montada a partir das peças do próprio mod: clique em Girar em 3D, arraste para ver de todos os lados e use a roda do mouse, a pinça ou os botões + e − para aproximar. Tela cheia abre a maquete no monitor inteiro. Junto, o bioma em que ela é gerada e os Pokémon que têm regra de spawn ligada a ela.</p>
  <p class="nota-editorial">As maquetes usam a cor média de cada bloco, sem textura, e não trazem o terreno em volta. Estruturas com peças sorteadas mudam de um mundo para outro; a maquete mostra uma das combinações.</p>
  <p class="nota-editorial">${semNomeOficial} delas não têm nome na tradução do mod: aparecem com o nome interno, em inglês.</p>
</section>
<section class="cb-estruturas">
  ${familias.map((f) => `<section aria-labelledby="t-${f.id}">
    <h2 id="t-${f.id}">${esc(f.nome)} <span class="dex-conta">${f.itens.length}</span></h2>
    <ul class="cb-estruturas-lista">
      ${f.itens.map((e) => `<li class="painel" id="${ancora(e)}">
        ${MAQUETES.estruturas[e.id] ? maquete(MAQUETES.estruturas[e.id], `Maquete de ${e.nome}`) : `<p class="maquete-sem">Sem maquete: o mod não gera esta estrutura na versão ${esc(C.versao)}.</p>`}
        <h3${e.oficial ? "" : ' lang="en"'}>${esc(e.nome)}</h3>
        ${MAQUETES.estruturas[e.id] ? `<p class="cb-onde">${MAQUETES.estruturas[e.id].tamanho.join(" × ")} blocos${MAQUETES.estruturas[e.id].pecas > 1 ? `, em ${MAQUETES.estruturas[e.id].pecas} peças` : ""}${MAQUETES.estruturas[e.id].parcial ? " (só o miolo: a estrutura inteira é bem maior)" : ""}</p>` : ""}
        <p class="cb-onde">Gerada em: ${esc(enumerar(e.biomas.map((b) => b.toLowerCase())))}</p>
        ${e.especies.length ? `<p class="cb-onde">Nascem aqui:</p>${fileira(e.especies, 16)}` : ""}
      </li>`).join("\n      ")}
    </ul>
  </section>`).join("\n  ")}
  <section aria-labelledby="t-do-jogo">
    <h2 id="t-do-jogo">Nas estruturas do Minecraft</h2>
    <p class="nota-editorial">Algumas espécies têm regra própria para nascer em construções do jogo base.</p>
    <ul class="cb-estruturas-lista">
      ${C.estruturasDoJogo.map((e) => `<li class="painel"><h3>${esc(maiuscula(e.nome))}</h3><p class="cb-onde">${e.especies.length === 1 ? "Uma espécie" : `${e.especies.length} espécies`}</p>${fileira(e.especies, 16)}</li>`).join("\n      ")}
    </ul>
  </section>
</section>`;
  return moldura({
    ...base, titulo: "Estruturas do Cobblemon", caminho: "/cobblemon/estruturas/", classe: "pagina-cb-estruturas", corpo, modulo: "maquete", espelho: "/regioes/",
    descricao: `As ${NUMEROS.estruturas} estruturas do Cobblemon ${C.versao}: habitats, ruínas, naufrágios e barcos, com o bioma de cada uma e os Pokémon que nascem ali.`
  });
}

/* ---------- biomas (com as informações gerais que eram do guia) ---------- */

export function paginaCobblemonBiomas() {
  const dataBR = (iso) => { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
  const cabo = C.itens.find((i) => i.id === "link_cable");
  const dosBiomas = (id) => C.biomas.filter((b) => b.ambiente === id);
  const TEXTOS = {
    campo: "Planícies, pradarias e campos de flores: o terreno aberto em que a maior parte dos jogadores começa.",
    floresta: "Florestas de carvalho e bétula, taigas e os campos de cogumelos.",
    selva: "Selvas fechadas, bambuzais e as ilhas tropicais.",
    montanha: "Colinas, picos e os biomas altos, onde a pedra aparece e a neve começa.",
    arido: "Desertos, ermos de terracota e savanas.",
    frio: "Tundras, planícies nevadas, picos de gelo e florestas sob neve.",
    "agua-doce": "Pântanos, manguezais, rios e lagos.",
    oceano: "Do litoral ao oceano profundo, frio, morno ou congelado.",
    caverna: "Tudo o que fica debaixo da terra, das cavernas de pedra às exuberantes.",
    nether: "A dimensão de baixo, com lava, florestas de fungo e vales de areia das almas.",
    fim: "A dimensão final: ilhas de pedra do Fim soltas no vazio."
  };
  const estruturasDe = (id) => C.estruturas.filter((e) => MAQUETES.estruturas[e.id] && ambientesDaEstrutura(e).includes(id));
  const corpo = `
<section class="cabecalho">
  <h1>Biomas</h1>
  <p class="prosa">O Cobblemon decide o que nasce olhando para o bioma. O atlas junta os biomas em ${extenso(C.ambientes.length)} ambientes; cada um aparece aqui como um pedaço de terreno em blocos, que você pode girar, com as estruturas do mod que são geradas ali.</p>
  <p class="nota-editorial">As maquetes dos ambientes são desenhos do atlas, feitos com os blocos de cada bioma. As das estruturas são montadas a partir dos arquivos do mod.</p>
  <nav class="filtro-opcoes cb-biomas-indice" aria-label="Ambientes">${C.ambientes.map((a) => `<a class="ficha" href="#${a.id}">${esc(a.nome)}</a>`).join("")}<a class="ficha" href="#geral">Informações gerais</a></nav>
</section>
<div class="cb-biomas">
  ${C.ambientes.map((a, k) => {
    const especies = NO_MOD.filter((e) => e.ambientes.includes(a.id)), grupos = dosBiomas(a.id), estruturas = estruturasDe(a.id);
    return `<section class="cb-bioma" id="${a.id}" aria-labelledby="t-${a.id}">
    ${maquete(MAQUETES.ambientes[a.id], `Maquete do ambiente ${a.nome}`, { auto: true, preguica: k > 0 })}
    <div class="cb-bioma-texto">
      <h2 id="t-${a.id}">${esc(a.nome)}</h2>
      <p class="prosa">${TEXTOS[a.id]}</p>
      <p class="cb-bioma-conta"><strong>${especies.length}</strong> espécies com regra de spawn aqui. <a href="/cobblemon/pokemon/?ambiente=${a.id}">Ver todas</a></p>
      <span class="fileira">${vitrine(a.id, 8).map((e) => slot(e.n, { lado: 64 })).join("")}</span>
      ${grupos.length ? `<details class="cb-bioma-grupos"><summary>Os biomas que entram aqui</summary><dl class="cb-glossario">
        ${grupos.map((b) => `<div><dt>${esc(b.nome)}</dt><dd>${b.inclui.length ? esc(b.inclui.join(", ")) : "Só com outros mods de bioma"}</dd></div>`).join("\n        ")}
      </dl></details>` : ""}
    </div>
    ${estruturas.length ? `<div class="cb-bioma-estruturas">
      <h3>Estruturas geradas aqui <span class="dex-conta">${estruturas.length}</span></h3>
      <ul>
        ${estruturas.map((e) => `<li><a href="/cobblemon/estruturas/#${ancora(e)}"><img src="/arte/maquete/${MAQUETES.estruturas[e.id].nome}.webp" alt="" width="96" height="96" loading="lazy" decoding="async"><span${e.oficial ? "" : ' lang="en"'}>${esc(e.nome)}</span></a></li>`).join("\n        ")}
      </ul>
    </div>` : ""}
  </section>`;
  }).join("\n  ")}
</div>
<article class="cb-guia" id="geral" aria-labelledby="t-geral">
  <h2 id="t-geral">Informações gerais</h2>
  <p class="prosa">O essencial sobre o Cobblemon, contado a partir do que está nos arquivos da versão ${esc(C.versao)}.</p>
  <section aria-labelledby="t-oque">
    <h3 id="t-oque">O que é</h3>
    <div class="prosa">
      <p>Cobblemon é um mod de código aberto que põe Pokémon dentro do Minecraft Java Edition. Funciona em Fabric e em NeoForge, e o código é publicado sob a licença MPL 2.0.</p>
      <p>Não há Liga nem história a seguir: os Pokémon passam a fazer parte do mundo, nascem conforme o bioma, a hora e o tempo, e você os captura, cria, monta e batalha do jeito que quiser. As batalhas são por turnos e usam o motor do Pokémon Showdown, que vem junto com o mod.</p>
    </div>
  </section>

  <section aria-labelledby="t-numeros">
    <h3 id="t-numeros">Em números</h3>
    <dl class="ficha-tecnica ficha-larga cb-contas">
      ${[
        [`${NUMEROS.noMod} de ${numero(NUMEROS.total)}`, "espécies já no mod"],
        [NUMEROS.nascem, "nascem no mundo"],
        [NUMEROS.bandos, "aparecem em bando"],
        [NUMEROS.alfas, "podem ser alfa"],
        [NUMEROS.montarias, "dá para montar"],
        [NUMEROS.ombro, "andam no ombro"],
        [NUMEROS.itens, "itens e blocos"],
        [NUMEROS.bolas, "Poké Bolas"],
        [C.contagens.bagas, "bagas"],
        [C.contagens.temperos, "temperos de cozinha"],
        [NUMEROS.estruturas, "estruturas"],
        [NUMEROS.fosseis, "fósseis para reviver"]
      ].map(([v, r]) => `<div><dd>${v}</dd><dt>${r}</dt></div>`).join("\n      ")}
    </dl>
  </section>

  <section aria-labelledby="t-nascer">
    <h3 id="t-nascer">Como o mod decide o que nasce</h3>
    <div class="prosa">
      <p>Cada espécie tem uma ou mais regras de spawn. Uma regra diz em que grupo de raridade o Pokémon está, em que biomas pode aparecer, em que faixa de nível e sob quais condições.</p>
      <p>São quatro grupos de raridade: comum, incomum, raro e ultrarraro. Das ${NUMEROS.nascem} espécies que nascem no mundo, ${NO_MOD.filter((e) => e.raridade === "common").length} têm ao menos uma regra comum, e ${NO_MOD.filter((e) => e.raridade === "ultra-rare").length} só aparecem como ultrarraras.</p>
      <p>As condições mais usadas são a hora do dia, ter ou não céu à vista, chuva, fase da lua, altura no mapa, blocos por perto e estar dentro de certa estrutura. Além de andando em terra, um Pokémon pode nascer debaixo d'água, na superfície da água, no fundo do mar ou na ponta da Pokévara.</p>
      <p>Esta edição deixou de fora ${C.contagens.deOutrosMods} regras que só valem com outros mods de bioma instalados.</p>
    </div>
  </section>

  <section aria-labelledby="t-troca">
    <h3 id="t-troca">Evoluir sem trocar</h3>
    <div class="prosa">
      <p>${TROCAS} espécies do mod evoluem por troca. Para quem joga sozinho, existe o ${esc(cabo?.nome ?? "Cabo de Ligação")}, que o jogo descreve assim: “${esc(cabo?.dica ?? "")}”.</p>
      <p>Outras evoluções foram adaptadas ao Minecraft: há espécies que dependem do bioma em que estão, de blocos andados ou de estar longe de uma vila. A página de cada Pokémon diz como ele evolui dentro do mod.</p>
    </div>
  </section>

  <section aria-labelledby="t-fosseis">
    <h3 id="t-fosseis">Fósseis</h3>
    <ul class="cb-fosseis">
      ${C.fosseis.map((f) => `<li>${slot(f.n, { lado: 64 })}<span><strong>${esc(C.especies[f.n].nome)}</strong><span>${esc(enumerar(f.fosseis))}</span></span></li>`).join("\n      ")}
    </ul>
  </section>

  <section aria-labelledby="t-curiosidades">
    <h3 id="t-curiosidades">Curiosidades</h3>
    <ul class="lista-marcada cb-fatos">
      ${curiosidades().map((f) => `<li>${esc(f)}</li>`).join("\n      ")}
    </ul>
    <p class="nota-editorial">Contas feitas sobre as regras de spawn e as fichas das espécies da versão ${esc(C.versao)}.</p>
  </section>

  <section aria-labelledby="t-versoes">
    <h3 id="t-versoes">Versões</h3>
    <ol class="cb-versoes">
      ${C.versoes.map(([nome, data]) => `<li><strong>${esc(nome)}</strong><span>${dataBR(data)}</span></li>`).join("\n      ")}
    </ol>
    <p class="nota-editorial">Datas das versões marcadas no repositório público do mod.</p>
  </section>
</article>`;
  return moldura({
    ...base, titulo: "Biomas do Cobblemon", caminho: "/cobblemon/biomas/", classe: "pagina-cb-biomas", corpo, modulo: "maquete", espelho: "/regioes/",
    descricao: `Os ${C.ambientes.length} ambientes do Cobblemon ${C.versao} em maquetes de blocos que giram, com os Pokémon e as estruturas de cada um, e como o mod decide o que nasce.`
  });
}

/* ---------- plano de caçada ---------- */

export function paginaCobblemonCacada() {
  const corpo = `
<section class="cabecalho">
  <h1>Plano de caçada</h1>
  <p class="prosa">Marque os Pokémon que você quer e veja em que bioma dá para achar mais deles de uma vez, com a raridade e as condições de cada um. A lista fica guardada neste navegador.</p>
</section>
<section class="cacada" data-cacada>
  <noscript><p class="prosa">O plano de caçada precisa de JavaScript. A página de cada espécie, a partir da <a href="/cobblemon/pokemon/">lista de Pokémon</a>, mostra onde ela nasce sem ele.</p></noscript>
  <form class="cacada-controles" aria-label="Lista de caçada">
    <div class="dex-busca"><label for="cacada-campo">Pôr na lista</label><input id="cacada-campo" type="search" list="lista-cacada" placeholder="Nome ou número" autocomplete="off" spellcheck="false"></div>
    <button type="submit" class="botao">Adicionar</button>
    <button type="button" class="ligacao" data-copiar hidden>Copiar o link desta lista</button>
    <button type="button" class="ligacao" data-limpar hidden>Esvaziar a lista</button>
    <p class="time-aviso" data-aviso aria-live="polite"></p>
    <datalist id="lista-cacada"></datalist>
  </form>
  <div class="cacada-alvos" data-alvos></div>
  <div class="cacada-plano" data-plano aria-live="polite"></div>
</section>`;
  return moldura({
    ...base, titulo: "Plano de caçada do Cobblemon", caminho: "/cobblemon/cacada/", classe: "pagina-cb-cacada", corpo, modulo: "cacada", espelho: "/time/",
    descricao: `Marque os Pokémon que você quer no Cobblemon ${C.versao} e veja em que bioma dá para achar mais deles de uma vez, com raridade e condições.`
  });
}

export function dadosDaRoletaCobblemon() {
  const FRASES = {
    campo: ["nos campos e planícies", "dos campos"], floresta: ["nas florestas", "das florestas"], selva: ["nas selvas e ilhas tropicais", "das selvas"],
    montanha: ["nas montanhas", "das montanhas"], arido: ["nos desertos e savanas", "dos desertos"], frio: ["na neve e no gelo", "do gelo"],
    "agua-doce": ["nos pântanos, rios e lagos", "dos pântanos e rios"], oceano: ["nos oceanos e no litoral", "dos oceanos"],
    caverna: ["nas cavernas", "das cavernas"], nether: ["no Nether", "do Nether"], fim: ["no Fim", "do Fim"]
  };
  return {
    ambientes: C.ambientes.map((a) => ({ id: a.id, em: FRASES[a.id][0], de: FRASES[a.id][1], especies: POR_AMBIENTE[a.id].filter((e) => e.spawns.length).map((e) => e.n) })),
    especies: Object.fromEntries(NO_MOD.map((e) => [e.n, [e.nome, e.tipos]])),
    montaveis: NO_MOD.filter(montavel).length, alfas: NUMEROS.alfas
  };
}
