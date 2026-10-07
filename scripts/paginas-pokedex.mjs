/* A Pokédex do atlas: a lista das espécies e a página de cada uma.
 * Tudo sai de dados/fichas.json e dados/pokedex.json; as curiosidades são
 * calculadas aqui, comparando cada espécie com as outras. */
import { ROMANOS } from "../dados/atlas.mjs";
import { POKEDEX, FICHAS, ORDEM_TIPOS, esc, semAcento, extenso, maiuscula, enumerar, numero, enderecoEspecie } from "./base.mjs";
import { moldura, ilha, ORDENADOS } from "./paginas.mjs";

const IDS = Object.keys(FICHAS).map(Number).sort((a, b) => a - b);
const TOTAL = IDS.length;
const tiposDe = (id) => POKEDEX.especies[id][1];
const n4 = (id) => String(id).padStart(4, "0");

const ATRIBUTOS = ["PS", "Ataque", "Defesa", "Ataque Especial", "Defesa Especial", "Velocidade"];
const TETO_ATRIBUTO = Math.max(...IDS.flatMap((id) => FICHAS[id].atributos));
const totalDe = (id) => FICHAS[id].atributos.reduce((a, b) => a + b, 0);

/* ---------- o que se sabe comparando as espécies entre si ---------- */

const contar = (valor) => { const m = new Map(); for (const id of IDS) { const v = valor(id); m.set(v, (m.get(v) || 0) + 1); } return m; };
const maiores = (valor, id) => IDS.filter((o) => valor(o) > valor(id)).length;
const menores = (valor, id) => IDS.filter((o) => valor(o) < valor(id)).length;

const chaveTipos = (id) => [...tiposDe(id)].sort().join("+");
const mesmaCombinacao = {};
for (const id of IDS) (mesmaCombinacao[chaveTipos(id)] ??= []).push(id);

const classes = contar((id) => FICHAS[id].classe);
const filhos = {};
for (const id of IDS) if (FICHAS[id].de) (filhos[FICHAS[id].de] ??= []).push(id);
const CAPTURA_MIN = Math.min(...IDS.map((id) => FICHAS[id].captura)), CAPTURA_MAX = Math.max(...IDS.map((id) => FICHAS[id].captura));

/* Em quais jogos do atlas cada espécie está, e com que número. */
const JOGOS_COM_LISTA = ORDENADOS.filter((j) => j.pokedex);
const presenca = {};
for (const j of JOGOS_COM_LISTA) {
  const vistos = new Set();
  for (const [lista, rotulo] of j.pokedex) {
    for (const [n, e] of POKEDEX.dex[lista]) {
      if (vistos.has(e)) continue;
      vistos.add(e);
      (presenca[e] ??= []).push({ jogo: j, n, rotulo });
    }
  }
}
const MAIS_PRESENTE = Math.max(...IDS.map((id) => (presenca[id] || []).length));

/* "espécie" e "megaevolução" são femininas: uma, duas, três... */
const extensoF = (n) => (n === 1 ? "uma" : n === 2 ? "duas" : extenso(n));
const quantas = (n, uma, varias) => (n === 1 ? `uma ${uma}` : `${extensoF(n)} ${varias}`);
const medida = (v) => numero(v, Number.isInteger(v) ? 0 : 1);
const soLetras = (t) => semAcento(t).replace(/[^a-z0-9]/g, "");
const ORDINAL = ["primeiro", "segundo", "terceiro"];

/* Até cinco fatos sobre a espécie, do mais raro ao mais comum. Todos saem dos
 * dados; nada aqui é opinião. As comparações valem para a forma padrão. */
function curiosidades(id) {
  const f = FICHAS[id], fatos = [];

  if (f.classe === "mitico") fatos.push(`É um dos ${classes.get("mitico")} Pokémon míticos.`);
  if (f.classe === "lendario") fatos.push(`É um dos ${classes.get("lendario")} Pokémon lendários.`);
  if (f.classe === "bebe") fatos.push("É um Pokémon bebê: ainda não pode ter filhotes.");

  const iguais = mesmaCombinacao[chaveTipos(id)], tipos = tiposDe(id);
  if (iguais.length === 1) {
    fatos.push(tipos.length === 2 ? `Nenhuma outra espécie combina os tipos ${tipos[0]} e ${tipos[1]}.` : `É a única espécie que é só do tipo ${tipos[0]}.`);
  } else if (iguais.length <= 3 && tipos.length === 2) {
    fatos.push(`Só ${extensoF(iguais.length)} espécies combinam os tipos ${tipos[0]} e ${tipos[1]}: ${enumerar(iguais.map((o) => FICHAS[o].nome))}.`);
  }

  const formas = [];
  if (f.megas) formas.push(f.megas === 1 ? "megaevolução" : `${extensoF(f.megas)} megaevoluções`);
  if (f.gmax) formas.push("forma Gigantamax");
  if (f.regionais.length) formas.push(`forma regional em ${enumerar(f.regionais.map(maiuscula))}`);
  if (formas.length) fatos.push(`Tem ${enumerar(formas)}.`);

  // o atributo em que a espécie mais se destaca, se estiver entre os dez maiores
  const disputas = [...ATRIBUTOS.map((rotulo, i) => ({ rotulo: `${rotulo} base`, v: f.atributos[i], g: maiores((o) => FICHAS[o].atributos[i], id) })),
    { rotulo: "Total de atributos", v: totalDe(id), g: maiores(totalDe, id) }].sort((a, b) => a.g - b.g);
  const melhor = disputas[0];
  if (melhor.g <= 9) {
    fatos.push(`${melhor.rotulo} de ${melhor.v}: ${melhor.g === 0 ? "nenhuma espécie tem mais" : `só ${quantas(melhor.g, "espécie tem", "espécies têm")} mais`}.`);
  } else {
    const abaixo = menores(totalDe, id);
    if (abaixo <= 4) fatos.push(`Total de atributos de ${totalDe(id)}: ${abaixo === 0 ? "nenhuma espécie tem menos" : `só ${quantas(abaixo, "espécie tem", "espécies têm")} menos`}.`);
  }

  const maisAltas = maiores((o) => FICHAS[o].altura, id), maisPesadas = maiores((o) => FICHAS[o].peso, id);
  if (maisAltas <= 4) fatos.push(maisAltas === 0 ? `Nenhuma espécie é mais alta: ${medida(f.altura)} m.` : `Mede ${medida(f.altura)} m: só ${quantas(maisAltas, "espécie é mais alta", "espécies são mais altas")}.`);
  else if (maisPesadas <= 4) fatos.push(maisPesadas === 0 ? `Nenhuma espécie é mais pesada: ${medida(f.peso)} kg.` : `Pesa ${medida(f.peso)} kg: só ${quantas(maisPesadas, "espécie é mais pesada", "espécies são mais pesadas")}.`);
  else if (menores((o) => FICHAS[o].peso, id) === 0) fatos.push(`Nenhuma espécie é mais leve: ${medida(f.peso)} kg.`);
  else if (menores((o) => FICHAS[o].altura, id) === 0) fatos.push(`Nenhuma espécie é mais baixa: ${medida(f.altura)} m.`);

  if ((filhos[id] || []).length >= 2) fatos.push(`Pode evoluir para ${extensoF(filhos[id].length)} espécies diferentes: ${enumerar(filhos[id].map((o) => FICHAS[o].nome))}.`);

  if (f.captura === CAPTURA_MIN) fatos.push(`Taxa de captura ${f.captura}, a mais baixa que existe.`);
  if (f.captura === CAPTURA_MAX) fatos.push(`Taxa de captura ${f.captura}, a mais alta que existe.`);

  if (f.femeas === 0) fatos.push("Só existem machos desta espécie.");
  if (f.femeas === 8) fatos.push("Só existem fêmeas desta espécie.");
  if (f.femeas === 1) fatos.push("Sete em cada oito exemplares são machos.");
  if (f.femeas === 7) fatos.push("Sete em cada oito exemplares são fêmeas.");
  if (f.femeas === -1 && !f.classe) fatos.push("Não tem gênero.");

  const onde = presenca[id] || [];
  if (onde.length === MAIS_PRESENTE) fatos.push(`Nenhuma espécie está na Pokédex de mais jogos do atlas: são ${onde.length}.`);
  if (onde.length === 1) fatos.push(`Só está na Pokédex de um jogo do atlas: ${onde[0].jogo.curto}.`);

  // para a espécie sem nada de raro, fatos que toda espécie tem
  const comuns = [];
  const pico = Math.max(...f.atributos), quais = ATRIBUTOS.filter((_, k) => f.atributos[k] === pico);
  comuns.push(quais.length === 1 ? `O atributo mais alto é ${quais[0]}: ${pico}.`
    : quais.length === 6 ? `Os seis atributos têm o mesmo valor: ${pico}.`
    : `Os atributos mais altos são ${enumerar(quais)}, com ${pico}.`);
  if (tipos.length === 1 && iguais.length > 1) comuns.push(`É uma das ${iguais.length} espécies que são só do tipo ${tipos[0]}.`);
  if (tipos.length === 2 && iguais.length > 3) {
    const outras = iguais.length - 1;
    comuns.push(`Mais ${outras <= 10 ? extensoF(outras) : outras} espécies têm a mesma combinação de tipos, ${tipos[0]} e ${tipos[1]}.`);
  }
  const familia = IDS.filter((o) => FICHAS[o].cadeia === f.cadeia);
  if (familia.length > 1) {
    const degrau = (o) => (FICHAS[o].de ? 1 + degrau(FICHAS[o].de) : 1);
    const estagios = Math.max(...familia.map(degrau));
    comuns.push(`É o ${ORDINAL[degrau(id) - 1]} estágio de uma linha de ${extenso(estagios)}.`);
  }
  while (fatos.length < 3 && comuns.length) fatos.push(comuns.shift());

  const [kana, romaji] = f.japones;
  const escolhidos = fatos.slice(0, 4);
  escolhidos.push(soLetras(romaji) === soLetras(f.nome) ? `No Japão, o nome é o mesmo: ${kana}.` : `No Japão, chama-se ${romaji} (${kana}).`);
  return escolhidos;
}

/* ---------- peças ---------- */

function mini(id, { classe = "" } = {}) {
  return `<span class="dex-arte ${classe}"><img src="/arte/mini/${id}.webp" data-cor="/arte/mini/${id}-cor.webp" alt="" width="92" height="92" loading="lazy" decoding="async"></span>`;
}

function itemDaLista(id) {
  const f = FICHAS[id], ts = tiposDe(id);
  return `<li data-n="${id}" data-nome="${esc(semAcento(f.nome))}" data-tipos="${ts.map(semAcento).join(" ")}"><a href="${enderecoEspecie(id)}">${mini(id)}<span class="dex-numero">${n4(id)}</span><span class="dex-nome">${esc(f.nome)}</span><span class="dex-tipos">${ts.join(", ")}</span></a></li>`;
}

const faixaDoAtributo = (v) => (v < 50 ? 1 : v < 75 ? 2 : v < 100 ? 3 : v < 125 ? 4 : 5);

function genero(f) {
  if (f.femeas === -1) return "Sem gênero";
  if (f.femeas === 0) return "Só machos";
  if (f.femeas === 8) return "Só fêmeas";
  const femeas = (f.femeas / 8) * 100;
  return `${numero(100 - femeas, femeas % 1 ? 1 : 0)}% machos, ${numero(femeas, femeas % 1 ? 1 : 0)}% fêmeas`;
}

/* A linha evolutiva em estágios: cada coluna é uma etapa, e os ramos ficam lado a lado. */
function linhaEvolutiva(id) {
  const familia = IDS.filter((o) => FICHAS[o].cadeia === FICHAS[id].cadeia);
  if (familia.length === 1) return `<p class="prosa">Não evolui, nem é evolução de outra espécie.</p>`;
  const estagios = [];
  let atual = familia.filter((o) => !FICHAS[o].de);
  while (atual.length) {
    estagios.push(atual);
    atual = atual.flatMap((o) => filhos[o] || []);
  }
  return `<ol class="evolucao">
      ${estagios.map((grupo) => `<li class="estagio"><ul>${grupo.map((o) => {
        const f = FICHAS[o];
        const dentro = `${mini(o)}<span class="dex-nome">${esc(f.nome)}</span>${f.como ? `<span class="evolucao-como">${esc(f.como)}</span>` : ""}`;
        return `<li>${o === id ? `<span class="evolucao-item" aria-current="true">${dentro}</span>` : `<a class="evolucao-item" href="${enderecoEspecie(o)}">${dentro}</a>`}</li>`;
      }).join("")}</ul></li>`).join("\n      ")}
    </ol>`;
}

/* ---------- a página de uma espécie ---------- */

export function paginaEspecie(id) {
  const f = FICHAS[id], ts = tiposDe(id);
  const i = IDS.indexOf(id);
  const anterior = IDS[i - 1], proxima = IDS[i + 1];
  const total = totalDe(id);
  const onde = presenca[id] || [];
  const ficha = [
    ["Altura", `${medida(f.altura)} m`],
    ["Peso", `${medida(f.peso)} kg`],
    ["Geração", `<a href="/pokedex/?g=${f.geracao}">${ROMANOS[f.geracao]}</a>`],
    ["Habilidades", f.habilidades.map(([nome, oculta]) => `${esc(nome)}${oculta ? " (oculta)" : ""}`).join(", ")],
    ["Grupos de ovos", f.ovos.join(" e ")],
    ["Gênero", genero(f)],
    ["Taxa de captura", `${f.captura} de ${CAPTURA_MAX}`],
    ["Crescimento", f.crescimento],
    ["Cor na Pokédex", f.cor],
    f.habitat ? ["Habitat", f.habitat] : null
  ].filter(Boolean);

  const corpo = `
<article class="especie">
  <section class="especie-topo">
    <div class="especie-texto">
      <p class="migalha"><a href="/pokedex/">Pokédex</a></p>
      <p class="especie-numero">Nº ${n4(id)}</p>
      <h1>${esc(f.nome)}</h1>
      <p class="especie-categoria">${esc(f.categoria)}</p>
      <ul class="especie-tipos" aria-label="Tipos">${ts.map((t) => `<li><a class="ficha" href="/pokedex/?tipo=${semAcento(t)}">${t}</a></li>`).join("")}</ul>
    </div>
    <figure class="prancha especie-prancha" tabindex="0">
      <span class="prancha-arte">
        <img class="prancha-rascunho" src="/arte/mini/${id}.webp" alt="" width="184" height="184">
        <canvas class="prancha-gravura" width="640" height="640" data-arte="/arte/mini/${id}-cor.webp" aria-hidden="true"></canvas>
        <img class="prancha-cor" src="/arte/mini/${id}-cor.webp" alt="Arte oficial de ${esc(f.nome)}" width="320" height="320">
      </span>
    </figure>
  </section>

  <section class="especie-atributos" aria-labelledby="t-atributos">
    <h2 id="t-atributos">Atributos</h2>
    <p class="nota-editorial">Valores base da forma padrão. A régua vai até ${TETO_ATRIBUTO}, o maior valor que existe.</p>
    <ul class="atributos-lista">
      ${f.atributos.map((v, k) => `<li><span class="atributo-nome">${ATRIBUTOS[k]}</span><span class="atributo-trilho" aria-hidden="true"><span class="atributo-barra faixa-${faixaDoAtributo(v)}" style="width:${((v / TETO_ATRIBUTO) * 100).toFixed(1)}%"></span></span><span class="atributo-valor">${v}</span></li>`).join("\n      ")}
      <li class="atributo-total"><span class="atributo-nome">Total</span><span></span><span class="atributo-valor">${total}</span></li>
    </ul>
  </section>

  <section class="especie-ficha" aria-labelledby="t-ficha">
    <h2 id="t-ficha">Ficha</h2>
    <dl class="ficha-tecnica ficha-larga">
      ${ficha.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("\n      ")}
    </dl>
    <p class="nota-editorial">Categoria, habilidades e itens aparecem em inglês, como nos jogos.</p>
  </section>

  <section class="especie-evolucao" aria-labelledby="t-evolucao">
    <h2 id="t-evolucao">Linha evolutiva</h2>
    ${linhaEvolutiva(id)}
  </section>

  <section class="especie-curiosidades" aria-labelledby="t-curiosidades">
    <h2 id="t-curiosidades">Curiosidades</h2>
    <ul class="lista-marcada">
      ${curiosidades(id).map((c) => `<li>${esc(c)}</li>`).join("\n      ")}
    </ul>
    <p class="nota-editorial">Comparações feitas entre as formas padrão das ${numero(TOTAL)} espécies.</p>
    ${f.entrada ? `<figure class="entrada">
      <blockquote lang="en"><p>${esc(f.entrada[0])}</p></blockquote>
      <figcaption>Entrada da Pokédex em Pokémon ${esc(f.entrada[1])}, no original em inglês.</figcaption>
    </figure>` : ""}
  </section>

  <section class="especie-jogos" aria-labelledby="t-jogos">
    <h2 id="t-jogos">Jogos em que aparece</h2>
    <p class="nota-editorial">${onde.length ? `Está na Pokédex de ${onde.length} dos ${JOGOS_COM_LISTA.length} jogos do atlas que têm lista. Derivados sem lista catalogada ficam de fora.` : "Não está na Pokédex regional de nenhum jogo do atlas."}</p>
    <ul class="jogos-da-especie">
      ${onde.map(({ jogo, n, rotulo }) => `<li><a href="/jogos/${jogo.slug}/">${ilha(jogo)}<span><span class="ilha-nome">${esc(jogo.curto)}</span><span class="ilha-meta">${jogo.ano}. ${rotulo === "Elenco" ? "No elenco" : `Nº ${String(n).padStart(3, "0")} em ${esc(rotulo)}`}</span></span></a></li>`).join("\n      ")}
    </ul>
  </section>

  <nav class="jogo-passos" aria-label="Espécies vizinhas">
    ${anterior ? `<a href="${enderecoEspecie(anterior)}"><span>Nº ${n4(anterior)}</span>${esc(FICHAS[anterior].nome)}</a>` : "<span></span>"}
    ${proxima ? `<a href="${enderecoEspecie(proxima)}"><span>Nº ${n4(proxima)}</span>${esc(FICHAS[proxima].nome)}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    titulo: `${f.nome}, Nº ${n4(id)}`, caminho: enderecoEspecie(id), classe: "pagina-especie", corpo, modulo: "especie",
    descricao: `${f.nome}, ${f.categoria}, tipo ${ts.join(" e ")}. Atributos, linha evolutiva, curiosidades e os jogos em que aparece.`
  });
}

/* ---------- a lista ---------- */

export function paginaPokedex() {
  const geracoes = [...new Set(IDS.map((id) => FICHAS[id].geracao))].sort((a, b) => a - b);
  const corpo = `
<section class="cabecalho">
  <h1>Pokédex</h1>
  <p class="prosa">As ${numero(TOTAL)} espécies, em gravura. Escolha uma para ver atributos, linha evolutiva, curiosidades e os jogos em que ela aparece.</p>
</section>
<section class="pokedex-geral" data-pokedex-geral>
  <form class="dex-controles" role="search" aria-label="Procurar na Pokédex">
    <div class="dex-busca">
      <label for="dex-procurar">Procurar</label>
      <input id="dex-procurar" name="q" type="search" placeholder="Nome ou número" autocomplete="off" spellcheck="false">
    </div>
    <div class="filtro-opcoes" role="group" aria-label="Geração">${geracoes.map((g) => `<button type="button" class="ficha" data-geracao="${g}" aria-pressed="false">${ROMANOS[g]}</button>`).join("")}</div>
    <div class="filtro-opcoes" role="group" aria-label="Tipo">${ORDEM_TIPOS.map((t) => `<button type="button" class="ficha ficha-tipo" data-tipo="${semAcento(t)}" aria-pressed="false">${t}</button>`).join("")}</div>
    <p class="dex-resumo"><span aria-live="polite"><strong data-dex-contagem>${numero(TOTAL)}</strong> <span data-dex-rotulo>espécies</span></span> <button type="button" class="ligacao" data-dex-limpar hidden>Limpar</button></p>
  </form>
  ${geracoes.map((g) => {
    const ids = IDS.filter((id) => FICHAS[id].geracao === g);
    return `<section class="dex-geracao" data-geracao="${g}" aria-labelledby="t-g${g}">
    <h2 id="t-g${g}">Geração ${ROMANOS[g]} <span>Nº ${n4(ids[0])} a ${n4(ids[ids.length - 1])}</span></h2>
    <ol class="gaveta">
      ${ids.map(itemDaLista).join("")}
    </ol>
  </section>`;
  }).join("\n  ")}
  <p class="vazio" data-dex-vazio hidden>Nenhuma espécie com esse nome, número ou tipo. Confira a grafia em inglês.</p>
</section>`;

  return moldura({
    titulo: "Pokédex", caminho: "/pokedex/", classe: "pagina-pokedex", corpo, modulo: "pokedex-geral",
    descricao: `As ${numero(TOTAL)} espécies de Pokémon em gravura, com atributos, linha evolutiva, curiosidades e os jogos em que cada uma aparece.`
  });
}

export const TODAS_AS_ESPECIES = IDS;
