/* A Pokédex do atlas: a lista das espécies e a página de cada uma.
 * Tudo sai de dados/fichas.json e dados/pokedex.json; as curiosidades são
 * calculadas aqui, comparando cada espécie com as outras. */
import { ROMANOS } from "../dados/atlas.mjs";
import { POKEDEX, FICHAS, COBBLEMON, FORMAS_COM_ARTE, ORDEM_TIPOS, esc, semAcento, extenso, maiuscula, enumerar, numero, enderecoEspecie, enderecoCobblemon, selo, nomeDoTipo } from "./base.mjs";
import { moldura, hex, ORDENADOS } from "./paginas.mjs";
import { b, ingles } from "./lingua.mjs";
import { LINGUAS } from "./textos.mjs";
import { FICHA_EN, evolucaoEmIngles } from "../dados/en.mjs";

const IDS = Object.keys(FICHAS).map(Number).sort((a, b) => a - b);
const TOTAL = IDS.length;
const tiposDe = (id) => POKEDEX.especies[id][1];
const n4 = (id) => String(id).padStart(4, "0");

const ATRIBUTOS_PT = ["PS", "Ataque", "Defesa", "Ataque Especial", "Defesa Especial", "Velocidade"];
const ATRIBUTOS_EN = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"];
const atributos = () => (ingles() ? ATRIBUTOS_EN : ATRIBUTOS_PT);
/* O vocabulário da ficha na língua da página. */
const daFicha = (campo, valor) => (ingles() ? FICHA_EN[campo][valor] : valor);
/* O jogo com o nome na língua da página. */
const jogoAqui = (j) => (ingles() ? LINGUAS.en.jogo(j) : j);
const NUMERO = () => b("Nº", "No.");
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
const extensoF = (n) => (ingles() ? extenso(n) : n === 1 ? "uma" : n === 2 ? "duas" : extenso(n));
const quantas = (n, uma, varias) => (n === 1 ? `uma ${uma}` : `${extensoF(n)} ${varias}`);
const medida = (v) => numero(v, Number.isInteger(v) ? 0 : 1);
const soLetras = (t) => semAcento(t).replace(/[^a-z0-9]/g, "");
const ORDINAL = () => b(["primeiro", "segundo", "terceiro"], ["first", "second", "third"]);
/* "só uma espécie tem mais" / "only one species has more", com o verbo e o plural de cada língua. */
const soQuantas = (n, pt1, ptN, en1, enN) => b(`só ${quantas(n, pt1, ptN)}`, `only ${extenso(n)} ${n === 1 ? en1 : enN}`);

/* Até cinco fatos sobre a espécie, do mais raro ao mais comum. Todos saem dos
 * dados; nada aqui é opinião. As comparações valem para a forma padrão. */
function curiosidades(id) {
  const f = FICHAS[id], fatos = [], ATRIBUTOS = atributos();

  if (f.classe === "mitico") fatos.push(b(`É um dos ${classes.get("mitico")} Pokémon míticos.`, `It is one of the ${classes.get("mitico")} Mythical Pokémon.`));
  if (f.classe === "lendario") fatos.push(b(`É um dos ${classes.get("lendario")} Pokémon lendários.`, `It is one of the ${classes.get("lendario")} Legendary Pokémon.`));
  if (f.classe === "bebe") fatos.push(b("É um Pokémon bebê: ainda não pode ter filhotes.", "It is a baby Pokémon: it cannot breed yet."));

  const iguais = mesmaCombinacao[chaveTipos(id)], tipos = tiposDe(id), [t1, t2] = tipos.map(nomeDoTipo);
  if (iguais.length === 1) {
    fatos.push(tipos.length === 2 ? b(`Nenhuma outra espécie combina os tipos ${t1} e ${t2}.`, `No other species combines the ${t1} and ${t2} types.`)
      : b(`É a única espécie que é só do tipo ${t1}.`, `It is the only species that is pure ${t1} type.`));
  } else if (iguais.length <= 3 && tipos.length === 2) {
    const nomes = enumerar(iguais.map((o) => FICHAS[o].nome));
    fatos.push(b(`Só ${extensoF(iguais.length)} espécies combinam os tipos ${t1} e ${t2}: ${nomes}.`, `Only ${extenso(iguais.length)} species combine the ${t1} and ${t2} types: ${nomes}.`));
  }

  const formas = [];
  if (f.megas) formas.push(f.megas === 1 ? b("megaevolução", "a Mega Evolution") : b(`${extensoF(f.megas)} megaevoluções`, `${extenso(f.megas)} Mega Evolutions`));
  if (f.gmax) formas.push(b("forma Gigantamax", "a Gigantamax form"));
  if (f.regionais.length) formas.push(b(`forma regional em ${enumerar(f.regionais.map(maiuscula))}`, `a regional form in ${enumerar(f.regionais.map(maiuscula))}`));
  if (formas.length) fatos.push(b(`Tem ${enumerar(formas)}.`, `It has ${enumerar(formas)}.`));

  // o atributo em que a espécie mais se destaca, se estiver entre os dez maiores
  const disputas = [...ATRIBUTOS.map((rotulo, i) => ({ rotulo: b(`${rotulo} base`, `Base ${rotulo}`), v: f.atributos[i], g: maiores((o) => FICHAS[o].atributos[i], id) })),
    { rotulo: b("Total de atributos", "Base stat total"), v: totalDe(id), g: maiores(totalDe, id) }].sort((a, b) => a.g - b.g);
  const melhor = disputas[0];
  if (melhor.g <= 9) {
    fatos.push(b(`${melhor.rotulo} de ${melhor.v}: `, `${melhor.rotulo} of ${melhor.v}: `) + (melhor.g === 0 ? b("nenhuma espécie tem mais", "no species has more") : soQuantas(melhor.g, "espécie tem mais", "espécies têm mais", "species has more", "species have more")) + ".");
  } else {
    const abaixo = menores(totalDe, id);
    if (abaixo <= 4) fatos.push(b(`Total de atributos de ${totalDe(id)}: `, `Base stat total of ${totalDe(id)}: `) + (abaixo === 0 ? b("nenhuma espécie tem menos", "no species has less") : soQuantas(abaixo, "espécie tem menos", "espécies têm menos", "species has less", "species have less")) + ".");
  }

  const maisAltas = maiores((o) => FICHAS[o].altura, id), maisPesadas = maiores((o) => FICHAS[o].peso, id);
  const altura = `${medida(f.altura)} m`, peso = `${medida(f.peso)} kg`;
  if (maisAltas <= 4) fatos.push(maisAltas === 0 ? b(`Nenhuma espécie é mais alta: ${altura}.`, `No species is taller: ${altura}.`)
    : b(`Mede ${altura}: `, `It is ${altura} tall: `) + soQuantas(maisAltas, "espécie é mais alta", "espécies são mais altas", "species is taller", "species are taller") + ".");
  else if (maisPesadas <= 4) fatos.push(maisPesadas === 0 ? b(`Nenhuma espécie é mais pesada: ${peso}.`, `No species is heavier: ${peso}.`)
    : b(`Pesa ${peso}: `, `It weighs ${peso}: `) + soQuantas(maisPesadas, "espécie é mais pesada", "espécies são mais pesadas", "species is heavier", "species are heavier") + ".");
  else if (menores((o) => FICHAS[o].peso, id) === 0) fatos.push(b(`Nenhuma espécie é mais leve: ${peso}.`, `No species is lighter: ${peso}.`));
  else if (menores((o) => FICHAS[o].altura, id) === 0) fatos.push(b(`Nenhuma espécie é mais baixa: ${altura}.`, `No species is shorter: ${altura}.`));

  if ((filhos[id] || []).length >= 2) {
    const nomes = enumerar(filhos[id].map((o) => FICHAS[o].nome));
    fatos.push(b(`Pode evoluir para ${extensoF(filhos[id].length)} espécies diferentes: ${nomes}.`, `It can evolve into ${extenso(filhos[id].length)} different species: ${nomes}.`));
  }

  if (f.captura === CAPTURA_MIN) fatos.push(b(`Taxa de captura ${f.captura}, a mais baixa que existe.`, `Catch rate ${f.captura}, the lowest there is.`));
  if (f.captura === CAPTURA_MAX) fatos.push(b(`Taxa de captura ${f.captura}, a mais alta que existe.`, `Catch rate ${f.captura}, the highest there is.`));

  if (f.femeas === 0) fatos.push(b("Só existem machos desta espécie.", "This species is male only."));
  if (f.femeas === 8) fatos.push(b("Só existem fêmeas desta espécie.", "This species is female only."));
  if (f.femeas === 1) fatos.push(b("Sete em cada oito exemplares são machos.", "Seven out of every eight are male."));
  if (f.femeas === 7) fatos.push(b("Sete em cada oito exemplares são fêmeas.", "Seven out of every eight are female."));
  if (f.femeas === -1 && !f.classe) fatos.push(b("Não tem gênero.", "It has no gender."));

  const onde = presenca[id] || [];
  if (onde.length === MAIS_PRESENTE) fatos.push(b(`Nenhuma espécie está na Pokédex de mais jogos do atlas: são ${onde.length}.`, `No species is in the Pokédex of more games in the atlas: ${onde.length} of them.`));
  if (onde.length === 1) fatos.push(b(`Só está na Pokédex de um jogo do atlas: ${onde[0].jogo.curto}.`, `It is in the Pokédex of only one game in the atlas: ${jogoAqui(onde[0].jogo).curto}.`));

  // para a espécie sem nada de raro, fatos que toda espécie tem
  const comuns = [];
  const pico = Math.max(...f.atributos), quais = ATRIBUTOS.filter((_, k) => f.atributos[k] === pico);
  comuns.push(quais.length === 1 ? b(`O atributo mais alto é ${quais[0]}: ${pico}.`, `Its highest stat is ${quais[0]}: ${pico}.`)
    : quais.length === 6 ? b(`Os seis atributos têm o mesmo valor: ${pico}.`, `All six stats have the same value: ${pico}.`)
    : b(`Os atributos mais altos são ${enumerar(quais)}, com ${pico}.`, `Its highest stats are ${enumerar(quais)}, at ${pico}.`));
  if (tipos.length === 1 && iguais.length > 1) comuns.push(b(`É uma das ${iguais.length} espécies que são só do tipo ${t1}.`, `It is one of the ${iguais.length} species that are pure ${t1} type.`));
  if (tipos.length === 2 && iguais.length > 3) {
    const outras = iguais.length - 1, quantasOutras = outras <= 10 ? extensoF(outras) : outras;
    comuns.push(b(`Mais ${quantasOutras} espécies têm a mesma combinação de tipos, ${t1} e ${t2}.`, `${maiuscula(String(quantasOutras))} other species share the same type combination, ${t1} and ${t2}.`));
  }
  const familia = IDS.filter((o) => FICHAS[o].cadeia === f.cadeia);
  if (familia.length > 1) {
    const degrau = (o) => (FICHAS[o].de ? 1 + degrau(FICHAS[o].de) : 1);
    const estagios = Math.max(...familia.map(degrau));
    comuns.push(b(`É o ${ORDINAL()[degrau(id) - 1]} estágio de uma linha de ${extenso(estagios)}.`, `It is the ${ORDINAL()[degrau(id) - 1]} stage of a line of ${extenso(estagios)}.`));
  }
  while (fatos.length < 3 && comuns.length) fatos.push(comuns.shift());

  const [kana, romaji] = f.japones;
  const escolhidos = fatos.slice(0, 4);
  escolhidos.push(soLetras(romaji) === soLetras(f.nome) ? b(`No Japão, o nome é o mesmo: ${kana}.`, `In Japan, the name is the same: ${kana}.`) : b(`No Japão, chama-se ${romaji} (${kana}).`, `In Japan, it is called ${romaji} (${kana}).`));
  return escolhidos;
}

/* ---------- peças ---------- */

function mini(id, { classe = "" } = {}) {
  return `<span class="dex-arte ${classe}"><img src="/arte/mini/${id}.webp" data-cor="/arte/mini/${id}-cor.webp" alt="" width="92" height="92" loading="lazy" decoding="async"></span>`;
}

function itemDaLista(id) {
  const f = FICHAS[id], ts = tiposDe(id);
  return `<li data-n="${id}" data-nome="${esc(semAcento(f.nome))}" data-tipos="${ts.map(semAcento).join(" ")}"><a href="${enderecoEspecie(id)}">${mini(id)}<span class="dex-numero">${n4(id)}</span><span class="dex-nome">${esc(f.nome)}</span><span class="dex-tipos">${ts.map(selo).join(" ")}</span></a></li>`;
}

const faixaDoAtributo = (v) => (v < 50 ? 1 : v < 75 ? 2 : v < 100 ? 3 : v < 125 ? 4 : 5);

function genero(f) {
  if (f.femeas === -1) return b("Sem gênero", "Genderless");
  if (f.femeas === 0) return b("Só machos", "Male only");
  if (f.femeas === 8) return b("Só fêmeas", "Female only");
  const femeas = (f.femeas / 8) * 100;
  return `${numero(100 - femeas, femeas % 1 ? 1 : 0)}% ${b("machos", "male")}, ${numero(femeas, femeas % 1 ? 1 : 0)}% ${b("fêmeas", "female")}`;
}

/* A linha evolutiva em estágios: cada coluna é uma etapa, e os ramos ficam lado a lado. */
function linhaEvolutiva(id) {
  const familia = IDS.filter((o) => FICHAS[o].cadeia === FICHAS[id].cadeia);
  if (familia.length === 1) return `<p class="prosa">${b("Não evolui, nem é evolução de outra espécie.", "It does not evolve, nor is it the evolution of another species.")}</p>`;
  const estagios = [];
  let atual = familia.filter((o) => !FICHAS[o].de);
  while (atual.length) {
    estagios.push(atual);
    atual = atual.flatMap((o) => filhos[o] || []);
  }
  return `<ol class="evolucao">
      ${estagios.map((grupo) => `<li class="estagio"><ul>${grupo.map((o) => {
        const f = FICHAS[o];
        const dentro = `${mini(o)}<span class="dex-nome">${esc(f.nome)}</span>${f.como ? `<span class="evolucao-como">${esc(ingles() ? evolucaoEmIngles(f.como) : f.como)}</span>` : ""}`;
        return `<li>${o === id ? `<span class="evolucao-item" aria-current="true">${dentro}</span>` : `<a class="evolucao-item" href="${enderecoEspecie(o)}">${dentro}</a>`}</li>`;
      }).join("")}</ul></li>`).join("\n      ")}
    </ol>`;
}

/* ---------- formas especiais ---------- */

const abreviados = () => b(["PS", "Atq", "Def", "AtE", "DfE", "Vel"], ["HP", "Atk", "Def", "SpA", "SpD", "Spe"]);
function classeDaForma(f) {
  if (f.classe === "mega") return f.slug.endsWith("-primal") ? b("Reversão Primitiva", "Primal Reversion") : b("Megaevolução", "Mega Evolution");
  if (f.classe === "gmax") return "Gigantamax";
  if (f.classe === "regional") return b(`Forma de ${maiuscula(f.regiao)}`, `${maiuscula(f.regiao)} form`);
  return b("Outra forma", "Other form");
}

function secaoDeFormas(id) {
  const f = FICHAS[id], padrao = f.atributos.reduce((a, b) => a + b, 0);
  const item = (x) => {
    const total = x.atributos.reduce((a, b) => a + b, 0), diferenca = total - padrao;
    const mudaram = x.atributos.some((v, k) => v !== f.atributos[k]);
    return `<li class="forma">
        ${FORMAS_COM_ARTE.has(x.id) ? `<figure class="prancha forma-prancha" tabindex="0"><span class="prancha-arte">
          <canvas class="prancha-gravura" width="400" height="400" aria-hidden="true"></canvas>
          <img class="prancha-cor" src="/arte/formas/${x.id}.webp" alt="${esc(b(`Arte oficial de ${x.nome}`, `Official art of ${x.nome}`))}" width="240" height="240" loading="lazy" decoding="async">
        </span></figure>` : ""}
        <div class="forma-texto">
          <p class="forma-classe">${classeDaForma(x)}</p>
          <h3 lang="en">${esc(x.nome)}</h3>
          <p class="forma-tipos">${x.tipos.map(selo).join(" ")}</p>
          ${mudaram ? `<dl class="forma-atributos">${x.atributos.map((v, k) => `<div${v !== f.atributos[k] ? ' class="mudou"' : ""}><dt>${abreviados()[k]}</dt><dd>${v}</dd></div>`).join("")}<div class="forma-total"><dt>Total</dt><dd>${total}</dd></div></dl>
          <p class="forma-nota">${diferenca === 0 ? b("Mesmo total da forma padrão, distribuído de outro jeito.", "Same total as the standard form, distributed differently.") : b(`${Math.abs(diferenca)} ${diferenca > 0 ? "a mais" : "a menos"} que a forma padrão.`, `${Math.abs(diferenca)} ${diferenca > 0 ? "more" : "less"} than the standard form.`)}</p>`
            : x.classe === "gmax" ? `<p class="forma-nota">${b(`Mesmos atributos base. Em campo, os PS aumentam e os golpes viram Golpes G-Max. Mede ${medida(x.altura)} m.`, `Same base stats. In battle, HP increases and moves become G-Max Moves. It is ${medida(x.altura)} m tall.`)}</p>`
            : `<p class="forma-nota">${b("Mesmos atributos da forma padrão.", "Same stats as the standard form.")}</p>`}
          ${x.habilidades.length ? `<p class="forma-nota"><span lang="en">${x.habilidades.map(([nome, oculta]) => `${esc(nome)}${oculta ? b(" (oculta)", " (hidden)") : ""}`).join(", ")}</span></p>` : ""}
        </div>
      </li>`;
  };
  const dynamax = f.dynamax ? b(`Está na Pokédex de Sword e Shield, onde pode usar Dynamax${f.gmax ? " e tem forma Gigantamax própria" : ""}.`, `It is in the Pokédex of Sword and Shield, where it can Dynamax${f.gmax ? " and has its own Gigantamax form" : ""}.`) : null;
  return `<section class="especie-formas" aria-labelledby="t-formas">
    <h2 id="t-formas">${b("Formas especiais", "Special forms")}</h2>
    ${f.formas.length ? `<p class="nota-editorial">${b("Megaevoluções, Gigantamax, formas regionais e outras formas que mudam tipos, atributos ou habilidades. Variações só de aparência ficam de fora. Os nomes são os dos jogos, em inglês.", "Mega Evolutions, Gigantamax, regional forms and other forms that change types, stats or abilities. Appearance-only variations are left out.")}</p>
    <ul class="formas-lista">
      ${f.formas.map(item).join("\n      ")}
    </ul>` : `<p class="prosa">${b(`${esc(f.nome)} não tem megaevolução, forma Gigantamax, forma regional nem outra forma que mude tipos ou atributos.`, `${esc(f.nome)} has no Mega Evolution, Gigantamax form, regional form or any other form that changes types or stats.`)}</p>`}
    ${dynamax ? `<p class="forma-dynamax">${dynamax}</p>` : ""}
  </section>`;
}

/* ---------- a página de uma espécie ---------- */

export function paginaEspecie(id) {
  const f = FICHAS[id], ts = tiposDe(id);
  const i = IDS.indexOf(id);
  const anterior = IDS[i - 1], proxima = IDS[i + 1];
  const total = totalDe(id);
  const onde = presenca[id] || [];
  const noCobblemon = Boolean(COBBLEMON.especies[id]?.impl);
  const ficha = [
    [b("Altura", "Height"), `${medida(f.altura)} m`],
    [b("Peso", "Weight"), `${medida(f.peso)} kg`],
    [b("Geração", "Generation"), `<a href="/pokedex/?g=${f.geracao}">${ROMANOS[f.geracao]}</a>`],
    [b("Habilidades", "Abilities"), f.habilidades.map(([nome, oculta]) => `${esc(nome)}${oculta ? b(" (oculta)", " (hidden)") : ""}`).join(", ")],
    [b("Grupos de ovos", "Egg groups"), enumerar(f.ovos.map((o) => daFicha("ovos", o)))],
    [b("Gênero", "Gender"), genero(f)],
    [b("Taxa de captura", "Catch rate"), b(`${f.captura} de ${CAPTURA_MAX}`, `${f.captura} out of ${CAPTURA_MAX}`)],
    [b("Crescimento", "Growth rate"), daFicha("crescimento", f.crescimento)],
    [b("Cor na Pokédex", "Pokédex color"), daFicha("cor", f.cor)],
    f.habitat ? ["Habitat", daFicha("habitat", f.habitat)] : null
  ].filter(Boolean);

  const corpo = `
<article class="especie">
  <section class="especie-topo">
    <div class="especie-texto">
      <p class="migalha"><a href="/pokedex/">Pokédex</a></p>
      <p class="especie-numero">${NUMERO()} ${n4(id)}</p>
      <h1>${esc(f.nome)}</h1>
      <p class="especie-categoria">${esc(f.categoria)}</p>
      <ul class="especie-tipos" aria-label="${b("Tipos", "Types")}">${ts.map((t) => `<li><a class="tipo" data-tipo="${semAcento(t)}" href="/pokedex/?tipo=${semAcento(t)}">${nomeDoTipo(t)}</a></li>`).join("")}</ul>
      <p class="especie-grito"><button type="button" class="botao botao-contorno botao-pequeno" data-grito="/gritos/${id}.ogg">${b("Ouvir o grito", "Hear the cry")}</button> <button type="button" class="botao botao-contorno botao-pequeno" data-falar="${esc(`${f.nome}, the ${f.categoria}.${f.entrada ? ` ${f.entrada[0]}` : ""}`)}" data-lingua="en-US" hidden>${b("Ouvir a Pokédex", "Hear the Pokédex")}</button> <span class="nota-editorial" data-grito-aviso aria-live="polite"></span></p>
    </div>
    <figure class="prancha especie-prancha" tabindex="0">
      <span class="prancha-arte">
        <img class="prancha-rascunho" src="/arte/mini/${id}.webp" alt="" width="184" height="184">
        <canvas class="prancha-gravura" width="640" height="640" data-arte="/arte/mini/${id}-cor.webp" aria-hidden="true"></canvas>
        <img class="prancha-cor" src="/arte/mini/${id}-cor.webp" alt="${esc(b(`Arte oficial de ${f.nome}`, `Official art of ${f.nome}`))}" width="320" height="320">
      </span>
    </figure>
  </section>

  <section class="especie-atributos" aria-labelledby="t-atributos">
    <h2 id="t-atributos">${b("Atributos", "Stats")}</h2>
    <p class="nota-editorial">${b(`Valores base da forma padrão. A régua vai até ${TETO_ATRIBUTO}, o maior valor que existe.`, `Base values of the standard form. The scale goes up to ${TETO_ATRIBUTO}, the highest value there is.`)}</p>
    <ul class="atributos-lista">
      ${f.atributos.map((v, k) => `<li><span class="atributo-nome">${atributos()[k]}</span><span class="atributo-trilho" aria-hidden="true"><span class="atributo-barra faixa-${faixaDoAtributo(v)}" style="width:${((v / TETO_ATRIBUTO) * 100).toFixed(1)}%"></span></span><span class="atributo-valor">${v}</span></li>`).join("\n      ")}
      <li class="atributo-total"><span class="atributo-nome">Total</span><span></span><span class="atributo-valor">${total}</span></li>
    </ul>
    <p class="atributos-mais"><a class="ligacao" href="/comparar/pokemon/?a=${f.slug}">${b(`Comparar ${esc(f.nome)} com outro Pokémon`, `Compare ${esc(f.nome)} with another Pokémon`)}</a></p>
  </section>

  <section class="especie-ficha" aria-labelledby="t-ficha">
    <h2 id="t-ficha">${b("Ficha", "Profile")}</h2>
    <dl class="ficha-tecnica ficha-larga">
      ${ficha.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("\n      ")}
    </dl>
    ${ingles() ? "" : '<p class="nota-editorial">Categoria, habilidades e itens aparecem em inglês, como nos jogos.</p>'}
  </section>

  ${secaoDeFormas(id)}

  <section class="especie-evolucao" aria-labelledby="t-evolucao">
    <h2 id="t-evolucao">${b("Linha evolutiva", "Evolution line")}</h2>
    ${linhaEvolutiva(id)}
  </section>

  <section class="especie-curiosidades" aria-labelledby="t-curiosidades">
    <h2 id="t-curiosidades">${b("Curiosidades", "Trivia")}</h2>
    <ul class="lista-marcada">
      ${curiosidades(id).map((c) => `<li>${esc(c)}</li>`).join("\n      ")}
    </ul>
    <p class="nota-editorial">${b(`Comparações feitas entre as formas padrão das ${numero(TOTAL)} espécies.`, `Comparisons made between the standard forms of the ${numero(TOTAL)} species.`)}</p>
    ${f.entrada ? `<figure class="entrada">
      <blockquote lang="en"><p>${esc(f.entrada[0])}</p></blockquote>
      <figcaption>${b(`Entrada da Pokédex em Pokémon ${esc(f.entrada[1])}, no original em inglês.`, `Pokédex entry from Pokémon ${esc(f.entrada[1])}.`)}</figcaption>
    </figure>` : ""}
  </section>

  <section class="especie-jogos" aria-labelledby="t-jogos">
    <h2 id="t-jogos">${b("Jogos em que aparece", "Games it appears in")}</h2>
    <p class="nota-editorial">${onde.length ? b(`Está na Pokédex de ${onde.length} dos ${JOGOS_COM_LISTA.length} jogos do atlas que têm lista. Derivados sem lista catalogada ficam de fora.`, `It is in the Pokédex of ${onde.length} of the ${JOGOS_COM_LISTA.length} games in the atlas that have a list. Spin-offs with no cataloged list are left out.`) : b("Não está na Pokédex regional de nenhum jogo do atlas.", "It is not in the regional Pokédex of any game in the atlas.")}</p>
    <ul class="jogos-da-especie">
      ${onde.map(({ jogo, n, rotulo }) => `<li><a href="/jogos/${jogo.slug}/">${hex(jogo)}<span><span class="hex-nome">${esc(jogoAqui(jogo).curto)}</span><span class="hex-meta">${jogo.ano}. ${rotulo === "Elenco" ? b("No elenco", "In the roster") : b(`Nº ${String(n).padStart(3, "0")} em ${esc(rotulo)}`, `No. ${String(n).padStart(3, "0")} in ${esc(LINGUAS.en.lista(rotulo))}`)}</span></span></a></li>`).join("\n      ")}
    </ul>
    ${noCobblemon ? `<p class="especie-cobblemon">${b("Também está no mod Cobblemon.", "It is also in the Cobblemon mod.")} <a href="${enderecoCobblemon(id)}">${b(`Ver onde ${esc(f.nome)} nasce por lá`, `See where ${esc(f.nome)} spawns there`)}</a>.</p>` : ""}
  </section>

  <nav class="jogo-passos" aria-label="${b("Espécies vizinhas", "Neighboring species")}">
    ${anterior ? `<a href="${enderecoEspecie(anterior)}"><span>${NUMERO()} ${n4(anterior)}</span>${esc(FICHAS[anterior].nome)}</a>` : "<span></span>"}
    ${proxima ? `<a href="${enderecoEspecie(proxima)}"><span>${NUMERO()} ${n4(proxima)}</span>${esc(FICHAS[proxima].nome)}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    titulo: `${f.nome}, ${NUMERO()} ${n4(id)}`, caminho: enderecoEspecie(id), classe: "pagina-especie", corpo, modulo: "especie",
    espelho: noCobblemon ? enderecoCobblemon(id) : "/cobblemon/pokemon/",
    descricao: b(`${f.nome}, ${f.categoria}, tipo ${ts.join(" e ")}. Atributos, linha evolutiva, curiosidades e os jogos em que aparece.`, `${f.nome}, ${f.categoria}, ${ts.map(nomeDoTipo).join(" and ")} type. Stats, evolution line, trivia and the games it appears in.`)
  });
}

/* ---------- a lista ---------- */

export function paginaPokedex() {
  const geracoes = [...new Set(IDS.map((id) => FICHAS[id].geracao))].sort((a, b) => a - b);
  const corpo = `
<section class="cabecalho">
  <h1>Pokédex</h1>
  <p class="prosa">${b(`As ${numero(TOTAL)} espécies, em gravura. Escolha uma para ver atributos, linha evolutiva, curiosidades e os jogos em que ela aparece.`, `All ${numero(TOTAL)} species, engraved. Pick one to see its stats, evolution line, trivia and the games it appears in.`)}</p>
</section>
<section class="pokedex-geral" data-pokedex-geral>
  <form class="dex-controles" role="search" aria-label="${b("Procurar na Pokédex", "Search the Pokédex")}">
    <div class="dex-busca">
      <label for="dex-procurar">${b("Procurar", "Search")}</label>
      <input id="dex-procurar" name="q" type="search" placeholder="${b("Nome ou número", "Name or number")}" autocomplete="off" spellcheck="false">
    </div>
    <div class="filtro-opcoes" role="group" aria-label="${b("Geração", "Generation")}">${geracoes.map((g) => `<button type="button" class="ficha" data-geracao="${g}" aria-pressed="false">${ROMANOS[g]}</button>`).join("")}</div>
    <div class="filtro-opcoes" role="group" aria-label="${b("Tipo", "Type")}">${ORDEM_TIPOS.map((t) => `<button type="button" class="ficha ficha-tipo" data-tipo="${semAcento(t)}" aria-pressed="false">${nomeDoTipo(t)}</button>`).join("")}</div>
    <p class="dex-resumo"><span aria-live="polite"><strong data-dex-contagem>${numero(TOTAL)}</strong> <span data-dex-rotulo>${b("espécies", "species")}</span></span> <button type="button" class="ligacao" data-dex-limpar hidden>${b("Limpar", "Clear")}</button></p>
  </form>
  ${geracoes.map((g) => {
    const ids = IDS.filter((id) => FICHAS[id].geracao === g);
    return `<section class="dex-geracao" data-geracao="${g}" aria-labelledby="t-g${g}">
    <h2 id="t-g${g}">${b("Geração", "Generation")} ${ROMANOS[g]} <span>${NUMERO()} ${n4(ids[0])} ${b("a", "to")} ${n4(ids[ids.length - 1])}</span></h2>
    <ol class="gaveta">
      ${ids.map(itemDaLista).join("")}
    </ol>
  </section>`;
  }).join("\n  ")}
  <p class="vazio" data-dex-vazio hidden>${b("Nenhuma espécie com esse nome, número ou tipo. Confira a grafia em inglês.", "No species with that name, number or type.")}</p>
</section>`;

  return moldura({
    titulo: "Pokédex", caminho: "/pokedex/", classe: "pagina-pokedex", corpo, modulo: "pokedex-geral", espelho: "/cobblemon/pokemon/",
    descricao: b(`As ${numero(TOTAL)} espécies de Pokémon em gravura, com atributos, linha evolutiva, curiosidades e os jogos em que cada uma aparece.`, `All ${numero(TOTAL)} Pokémon species as engravings, with stats, evolution line, trivia and the games each one appears in.`)
  });
}

export const TODAS_AS_ESPECIES = IDS;
