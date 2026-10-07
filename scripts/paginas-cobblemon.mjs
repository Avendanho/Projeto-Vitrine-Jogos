/* A edição Cobblemon do atlas: início, lista de Pokémon, página de cada espécie,
 * itens, estruturas e guia. Tudo sai de dados/cobblemon.json, que é extraído dos
 * arquivos do próprio mod; as curiosidades e os números são calculados aqui. */
import { MODELOS, COBBLEMON, FICHAS, ORDEM_TIPOS, esc, semAcento, numero, extenso, maiuscula, enumerar, enderecoEspecie, enderecoCobblemon } from "./base.mjs";
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
const fileira = (ns, limite = 18) => `<span class="fileira">${ns.slice(0, limite).map((n) => slot(n, { lado: 48 })).join("")}${ns.length > limite ? `<span class="fileira-resto">e mais ${ns.length - limite}</span>` : ""}</span>`;

const mais = (lista, chave) => { const m = new Map(); for (const x of lista) for (const k of [].concat(chave(x))) m.set(k, (m.get(k) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]); };

/* ---------- números e curiosidades, calculados dos dados ---------- */

const linhasDe = (e) => e.spawns;
const soSe = (teste) => NO_MOD.filter((e) => e.spawns.length && e.spawns.every(teste));
const POR_AMBIENTE = Object.fromEntries(C.ambientes.map((a) => [a.id, NO_MOD.filter((e) => e.ambientes.includes(a.id))]));
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
    <li class="painel"><a href="/cobblemon/guia/"><h3>Guia</h3><p>Como o mod decide o que nasce, os ${NUMEROS.fosseis} fósseis, o glossário de biomas e as curiosidades.</p></a></li>
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
  const item = (e) => `<li data-n="${e.n}" data-nome="${esc(semAcento(e.nome))}" data-tipos="${e.tipos.map(semAcento).join(" ")}" data-ambientes="${e.ambientes.join(" ")}" data-raridade="${e.raridade ?? ""}"${montavel(e) ? " data-monta" : ""}${e.impl ? "" : " data-falta hidden"}>${e.impl
    ? `<a href="${enderecoCobblemon(e.n)}">${slot(e.n, { ligacao: false })}<span class="dex-numero">${n4(e.n)}</span><span class="dex-nome">${esc(e.nome)}</span><span class="dex-tipos">${e.tipos.join(", ")}</span></a>`
    : `<span class="cb-falta">${slot(e.n, { ligacao: false })}<span class="dex-numero">${n4(e.n)}</span><span class="dex-nome">${esc(e.nome)}</span><span class="dex-tipos">Ainda não está no mod</span></span>`}</li>`;
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
    <p class="dex-resumo"><span aria-live="polite"><strong data-dex-contagem>${NUMEROS.noMod}</strong> <span data-dex-rotulo>espécies</span></span> <button type="button" class="ligacao" data-dex-limpar hidden>Limpar</button> <button type="button" class="ligacao" data-dex-faltam aria-pressed="false">Mostrar também as ${NUMEROS.faltam} que ainda faltam</button></p>
  </form>
  <ol class="gaveta gaveta-cb">
    ${ESPECIES.map(item).join("")}
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
    </div>
    ${MODELOS.has(n)
      ? `<figure class="cb-retrato painel" data-retrato="${n}">
      <img class="cb-modelo" src="/arte/modelo/${n}.webp" alt="${esc(e.nome)}, o modelo do Cobblemon" width="400" height="400">
      <canvas class="cb-revela" width="400" height="400" data-tinta="/arte/modelo/${n}-tinta.png" aria-hidden="true"></canvas>
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
    ...base, titulo: `${e.nome} no Cobblemon`, caminho: enderecoCobblemon(n), classe: "pagina-cb-especie", corpo, modulo: "cobblemon-especie", espelho: enderecoEspecie(n),
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
  const corpo = `
<section class="cabecalho">
  <h1>Itens</h1>
  <p class="prosa">${NUMEROS.itens} itens e blocos do Cobblemon ${esc(C.versao)}, com o nome e a descrição da tradução do próprio mod. Onde há receita de bancada, ela vem junto.</p>
</section>
<section class="cb-itens" data-cb-itens>
  <form class="dex-controles" role="search" aria-label="Procurar item">
    <div class="dex-busca">
      <label for="item-procurar">Procurar item</label>
      <input id="item-procurar" type="search" placeholder="Nome ou efeito" autocomplete="off" spellcheck="false">
    </div>
    <nav class="filtro-opcoes" aria-label="Grupos">${grupos.map((g) => `<a class="ficha" href="#g-${g.id}">${esc(g.nome)} <span class="dex-conta">${g.itens.length}</span></a>`).join("")}</nav>
    <p class="dex-resumo" aria-live="polite"><strong data-dex-contagem>${NUMEROS.itens}</strong> <span data-dex-rotulo>itens</span></p>
  </form>
  ${grupos.map((g) => `<section class="cb-grupo" id="g-${g.id}" aria-labelledby="t-${g.id}">
    <h2 id="t-${g.id}">${esc(g.nome)}</h2>
    ${NOTAS[g.id] ? `<p class="nota-editorial">${NOTAS[g.id]}</p>` : ""}
    <ul class="cb-itens-lista">
      ${g.itens.map((i) => `<li data-busca="${esc(semAcento(`${i.nome} ${i.dica ?? ""}`))}"><strong>${esc(i.nome)}</strong>${i.dica ? `<span>${esc(i.dica)}</span>` : ""}${i.receita ? `<span class="cb-receita">Feito com ${esc(enumerar(i.receita.ingredientes))}.${i.receita.rende > 1 ? ` Rende ${i.receita.rende}.` : ""}</span>` : ""}</li>`).join("\n      ")}
    </ul>
  </section>`).join("\n  ")}
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
  <p class="prosa">O Cobblemon ${esc(C.versao)} espalha ${NUMEROS.estruturas} estruturas próprias pelo mundo. Para cada uma, o bioma em que ela é gerada e os Pokémon que têm regra de spawn ligada a ela.</p>
  <p class="nota-editorial">${semNomeOficial} delas não têm nome na tradução do mod: aparecem com o nome interno, em inglês.</p>
</section>
<section class="cb-estruturas">
  ${familias.map((f) => `<section aria-labelledby="t-${f.id}">
    <h2 id="t-${f.id}">${esc(f.nome)} <span class="dex-conta">${f.itens.length}</span></h2>
    <ul class="cb-estruturas-lista">
      ${f.itens.map((e) => `<li class="painel">
        <h3${e.oficial ? "" : ' lang="en"'}>${esc(e.nome)}</h3>
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
    ...base, titulo: "Estruturas do Cobblemon", caminho: "/cobblemon/estruturas/", classe: "pagina-cb-estruturas", corpo, espelho: "/regioes/",
    descricao: `As ${NUMEROS.estruturas} estruturas do Cobblemon ${C.versao}: habitats, ruínas, naufrágios e barcos, com o bioma de cada uma e os Pokémon que nascem ali.`
  });
}

/* ---------- guia ---------- */

export function paginaCobblemonGuia() {
  const dataBR = (iso) => { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; };
  const cabo = C.itens.find((i) => i.id === "link_cable");
  const corpo = `
<section class="cabecalho">
  <h1>Guia</h1>
  <p class="prosa">O essencial sobre o Cobblemon, contado a partir do que está nos arquivos da versão ${esc(C.versao)}.</p>
</section>
<article class="cb-guia">
  <section aria-labelledby="t-oque">
    <h2 id="t-oque">O que é</h2>
    <div class="prosa">
      <p>Cobblemon é um mod de código aberto que põe Pokémon dentro do Minecraft Java Edition. Funciona em Fabric e em NeoForge, e o código é publicado sob a licença MPL 2.0.</p>
      <p>Não há Liga nem história a seguir: os Pokémon passam a fazer parte do mundo, nascem conforme o bioma, a hora e o tempo, e você os captura, cria, monta e batalha do jeito que quiser. As batalhas são por turnos e usam o motor do Pokémon Showdown, que vem junto com o mod.</p>
    </div>
  </section>

  <section aria-labelledby="t-numeros">
    <h2 id="t-numeros">Em números</h2>
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
    <h2 id="t-nascer">Como o mod decide o que nasce</h2>
    <div class="prosa">
      <p>Cada espécie tem uma ou mais regras de spawn. Uma regra diz em que grupo de raridade o Pokémon está, em que biomas pode aparecer, em que faixa de nível e sob quais condições.</p>
      <p>São quatro grupos de raridade: comum, incomum, raro e ultrarraro. Das ${NUMEROS.nascem} espécies que nascem no mundo, ${NO_MOD.filter((e) => e.raridade === "common").length} têm ao menos uma regra comum, e ${NO_MOD.filter((e) => e.raridade === "ultra-rare").length} só aparecem como ultrarraras.</p>
      <p>As condições mais usadas são a hora do dia, ter ou não céu à vista, chuva, fase da lua, altura no mapa, blocos por perto e estar dentro de certa estrutura. Além de andando em terra, um Pokémon pode nascer debaixo d'água, na superfície da água, no fundo do mar ou na ponta da Pokévara.</p>
      <p>Esta edição deixou de fora ${C.contagens.deOutrosMods} regras que só valem com outros mods de bioma instalados.</p>
    </div>
  </section>

  <section aria-labelledby="t-troca">
    <h2 id="t-troca">Evoluir sem trocar</h2>
    <div class="prosa">
      <p>${TROCAS} espécies do mod evoluem por troca. Para quem joga sozinho, existe o ${esc(cabo?.nome ?? "Cabo de Ligação")}, que o jogo descreve assim: “${esc(cabo?.dica ?? "")}”.</p>
      <p>Outras evoluções foram adaptadas ao Minecraft: há espécies que dependem do bioma em que estão, de blocos andados ou de estar longe de uma vila. A página de cada Pokémon diz como ele evolui dentro do mod.</p>
    </div>
  </section>

  <section aria-labelledby="t-fosseis">
    <h2 id="t-fosseis">Fósseis</h2>
    <ul class="cb-fosseis">
      ${C.fosseis.map((f) => `<li>${slot(f.n, { lado: 64 })}<span><strong>${esc(C.especies[f.n].nome)}</strong><span>${esc(enumerar(f.fosseis))}</span></span></li>`).join("\n      ")}
    </ul>
  </section>

  <section aria-labelledby="t-curiosidades">
    <h2 id="t-curiosidades">Curiosidades</h2>
    <ul class="lista-marcada cb-fatos">
      ${curiosidades().map((f) => `<li>${esc(f)}</li>`).join("\n      ")}
    </ul>
    <p class="nota-editorial">Contas feitas sobre as regras de spawn e as fichas das espécies da versão ${esc(C.versao)}.</p>
  </section>

  <section aria-labelledby="t-biomas">
    <h2 id="t-biomas">Glossário de biomas</h2>
    <p class="nota-editorial">O mod agrupa os biomas em categorias. Aqui, os biomas do Minecraft que cada uma cobre. As que aparecem sem lista dependem de outros mods de bioma.</p>
    <dl class="cb-glossario">
      ${C.biomas.map((b) => `<div><dt>${esc(b.nome)}</dt><dd>${b.inclui.length ? esc(b.inclui.join(", ")) : "Só com outros mods de bioma"}</dd></div>`).join("\n      ")}
    </dl>
  </section>

  <section aria-labelledby="t-versoes">
    <h2 id="t-versoes">Versões</h2>
    <ol class="cb-versoes">
      ${C.versoes.map(([nome, data]) => `<li><strong>${esc(nome)}</strong><span>${dataBR(data)}</span></li>`).join("\n      ")}
    </ol>
    <p class="nota-editorial">Datas das versões marcadas no repositório público do mod.</p>
  </section>
</article>`;
  return moldura({
    ...base, titulo: "Guia do Cobblemon", caminho: "/cobblemon/guia/", classe: "pagina-cb-guia", corpo,
    descricao: `O que é o Cobblemon, como o mod decide o que nasce, os ${NUMEROS.fosseis} fósseis, o glossário de biomas, as versões e curiosidades tiradas dos dados da ${C.versao}.`
  });
}

/* ---------- dados para a roleta de desafios do Cobblemon ---------- */

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
