/* As ferramentas da edição Pokémon: comparar dois Pokémon, o montador de time e o diário
 * de desafio. Aqui só nasce a moldura de cada página; quem a faz funcionar é o módulo de mesmo nome em src/js/. */
import { moldura } from "./paginas.mjs";
import { esc, enumerar, semAcento, ENCONTROS, ORDEM_TIPOS } from "./base.mjs";
import { EIXOS, alcance } from "../src/js/hexagono.js";
import { lugarNaRoda } from "../src/js/tipos-logica.js";
import { ORDENADOS } from "./paginas.mjs";
import { b, ingles } from "./lingua.mjs";
import { LINGUAS } from "./textos.mjs";
import { nomeDoTipo } from "./base.mjs";
import { JOGOS } from "../dados/jogos.mjs";
import { jogosParaONavegador } from "./dados-navegador.mjs";

export const ATRIBUTOS = ["PS", "Ataque", "Defesa", "Ataque Especial", "Defesa Especial", "Velocidade"];
const ATRIBUTOS_EN = ["HP", "Attack", "Defense", "Special Attack", "Special Defense", "Speed"];
const aqui = (j) => (ingles() ? LINGUAS.en.jogo(j) : j);
const eixoAqui = (e) => (ingles() ? LINGUAS.en.eixo(e) : e.nome);
const semJs = (texto) => `<noscript><p class="prosa">${texto}</p></noscript>`;

/* ---------- comparar dois Pokémon ---------- */

export function paginaCompararPokemon() {
  const campo = (lado, rotulo) => `<div class="dex-busca"><label for="duelo-${lado}">${rotulo}</label><input id="duelo-${lado}" name="${lado}" type="search" list="lista-especies" placeholder="${b("Nome ou número", "Name or number")}" autocomplete="off" spellcheck="false"></div>`;
  const corpo = `
<section class="cabecalho">
  <p class="migalha"><a href="/comparar/">${b("Comparar", "Compare")}</a></p>
  <h1>${b("Comparar Pokémon", "Compare Pokémon")}</h1>
  <p class="prosa">${b("Escolha dois Pokémon e veja os atributos de base frente a frente. Em cada linha, quem leva vantagem fica com o número aceso e a barra verde.", "Pick two Pokémon and see their base stats face to face. On each line, the one with the advantage gets the lit number and the green bar.")}</p>
</section>
<section class="duelo" data-duelo>
  ${semJs(b('O comparador precisa de JavaScript. Sem ele, a página de cada espécie, a partir da <a href="/pokedex/">Pokédex</a>, traz os mesmos atributos.', 'The comparison needs JavaScript. Without it, each species page, starting from the <a href="/pokedex/">Pokédex</a>, has the same stats.'))}
  <form class="duelo-campos" role="search" aria-label="${b("Pokémon a comparar", "Pokémon to compare")}">
    ${campo("a", b("De um lado", "On one side"))}
    <button type="button" class="ligacao" data-trocar>${b("Trocar de lado", "Swap sides")}</button>
    ${campo("b", b("Do outro", "On the other"))}
    <datalist id="lista-especies"></datalist>
  </form>
  <div class="duelo-palco">
    <article class="duelo-lado" data-lado="a" aria-live="polite"></article>
    <ol class="duelo-atributos" aria-label="${b("Atributos de base", "Base stats")}">
      ${b(ATRIBUTOS, ATRIBUTOS_EN).map((nome) => `<li><span class="duelo-valor" data-valor="a"></span><span class="duelo-trilho duelo-trilho-a" aria-hidden="true"><span class="duelo-barra" data-barra="a"></span></span><span class="duelo-nome">${nome}</span><span class="duelo-trilho" aria-hidden="true"><span class="duelo-barra" data-barra="b"></span></span><span class="duelo-valor" data-valor="b"></span></li>`).join("\n      ")}
      <li class="duelo-total"><span class="duelo-valor" data-valor="a"></span><span></span><span class="duelo-nome">Total</span><span></span><span class="duelo-valor" data-valor="b"></span></li>
    </ol>
    <article class="duelo-lado" data-lado="b" aria-live="polite"></article>
  </div>
</section>`;
  return moldura({
    titulo: b("Comparar dois Pokémon", "Compare two Pokémon"), caminho: "/comparar/pokemon/", classe: "pagina-duelo", corpo, modulo: "comparar-pokemon",
    descricao: b("Dois Pokémon frente a frente: atributos de base, tipos, altura e peso, com a vantagem de cada linha em destaque.", "Two Pokémon face to face: base stats, types, height and weight, with the advantage on each line highlighted.")
  });
}

/* ---------- montador de time ---------- */

export function paginaTime() {
  const jogos = jogosParaONavegador();
  const corpo = `
<section class="cabecalho">
  <h1>${b("Montar um time", "Build a team")}</h1>
  <p class="prosa">${b("Escolha até seis Pokémon e veja de que o time apanha, a que ele resiste e o que ele não consegue atingir com vantagem. Se você escolher um jogo, as sugestões ficam só com o que existe na Pokédex dele.", "Pick up to six Pokémon and see what the team is weak to, what it resists and what it cannot hit for double damage. If you pick a game, the suggestions keep only what exists in its Pokédex.")}</p>
  <p><a class="ligacao" href="/tipos/">${b("Ver a roda de tipos", "See the type wheel")}</a></p>
</section>
<section class="time" data-time>
  ${semJs(b('O montador de time precisa de JavaScript. A <a href="/pokedex/">Pokédex</a> mostra os tipos de cada espécie sem ele.', 'The team builder needs JavaScript. The <a href="/pokedex/">Pokédex</a> shows the types of each species without it.'))}
  <form class="time-controles" aria-label="${b("Montar o time", "Build the team")}">
    <label class="escolha"><span>${b("Jogo", "Game")}</span><select name="jogo"><option value="">${b("Qualquer jogo", "Any game")}</option>${jogos.map((j) => `<option value="${j.slug}">${esc(b(j.nome, j.nome.replace(/ e /g, " and ")))}</option>`).join("")}</select></label>
    <div class="dex-busca"><label for="time-campo">${b("Pôr no time", "Add to the team")}</label><input id="time-campo" type="search" list="lista-time" placeholder="${b("Nome ou número", "Name or number")}" autocomplete="off" spellcheck="false"></div>
    <button type="submit" class="botao">${b("Adicionar", "Add")}</button>
    <button type="button" class="ligacao" data-limpar hidden>${b("Esvaziar o time", "Empty the team")}</button>
    <p class="time-aviso" data-aviso aria-live="polite"></p>
    <datalist id="lista-time"></datalist>
  </form>
  <ol class="time-vagas" data-vagas aria-label="${b("O time", "The team")}"></ol>
  <div class="time-leitura" data-resumo aria-live="polite"></div>
  <p class="nota-editorial">${b("Em cada vaga: o que aquele Pokémon recebe em quádruplo ou em dobro, a que resiste e do que é imune. O número ao lado de um tipo, na leitura do time, é quantos do time estão naquela situação. A conta olha só os tipos; habilidades e itens ficam de fora.", "In each slot: what that Pokémon takes for quadruple or double damage, what it resists and what it is immune to. The number next to a type, in the team reading, is how many in the team are in that situation. The math looks only at types; abilities and items are left out.")}</p>
</section>`;
  return moldura({
    titulo: b("Montar um time de Pokémon", "Build a Pokémon team"), caminho: "/time/", classe: "pagina-time", corpo, modulo: "time",
    descricao: b("Monte um time de até seis Pokémon e veja fraquezas, resistências e o que falta cobrir, com filtro pela Pokédex de cada jogo.", "Build a team of up to six Pokémon and see weaknesses, resistances and what is left uncovered, filtered by each game's Pokédex.")
  });
}

/* ---------- diário de desafio ---------- */

/* O endereço que abre o diário com uma campanha já preenchida: é assim que um desafio ou a roleta passam as regras adiante. */
export function enderecoDoDiario({ nome, jogo, regras }) {
  const busca = new URLSearchParams({ nome, ...(jogo ? { jogo } : {}), regras: regras.slice(0, 1500) });
  return `/diario/?${busca}`;
}

export function paginaDiario() {
  const corpo = `
<section class="cabecalho">
  <p class="migalha"><a href="/desafios/">Desafios</a></p>
  <h1>Diário de desafio</h1>
  <p class="prosa">Acompanhe uma campanha do começo ao fim: o que foi capturado em cada lugar, quem está no time, quem ficou na caixa e quem caiu pelo caminho. Serve para um Nuzlocke, para um desafio do atlas ou para as regras que você inventar.</p>
  <p class="nota-editorial">O diário fica guardado neste navegador. Exporte de vez em quando: se os dados do navegador forem limpos, ele some. Em ${enumerar(JOGOS.filter((j) => ENCONTROS[j.slug]).map((j) => j.curto))}, o diário mostra o que aparece em cada rota, com os dados da PokéAPI. Nos outros jogos ela não tem essa tabela, e a espécie capturada é você quem informa.</p>
</section>
<section class="diario" data-diario>
  ${semJs('O diário precisa de JavaScript. Os <a href="/desafios/">desafios</a> podem ser lidos sem ele.')}
  <div data-palco></div>
</section>`;
  return moldura({
    titulo: "Diário de desafio", caminho: "/diario/", classe: "pagina-diario", corpo, modulo: "diario",
    descricao: "Acompanhe um Nuzlocke ou um desafio de Pokémon: capturas por rota, time, caixa, quem caiu e insígnias, guardados no seu navegador."
  });
}

/* ---------- roda de tipos ---------- */

export function paginaTipos() {
  const corpo = `
<section class="cabecalho">
  <p class="migalha"><a href="/time/">${b("Montar um time", "Build a team")}</a></p>
  <h1>${b("Roda de tipos", "Type wheel")}</h1>
  <p class="prosa">${b("Escolha um tipo. As linhas cheias vão dele para quem ele atinge em dobro; as tracejadas chegam nele, vindas de quem o atinge em dobro. Ao lado, o resto: o que ele atinge pela metade, a que resiste e o que não faz efeito.", "Pick a type. The solid lines go from it to the types it hits for double damage; the dashed ones come into it, from the types that hit it for double damage. Beside it, the rest: what it hits for half, what it resists and what has no effect.")}</p>
</section>
<section class="roda" data-roda>
  ${semJs(b('A roda de tipos precisa de JavaScript. Sem ele, o <a href="/time/">montador de time</a> também não funciona; a <a href="/pokedex/">Pokédex</a> mostra os tipos de cada espécie.', 'The type wheel needs JavaScript. Without it, the <a href="/time/">team builder</a> does not work either; the <a href="/pokedex/">Pokédex</a> shows the types of each species.'))}
  <div class="roda-disco">
    <svg class="roda-linhas" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs><marker id="roda-seta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z"/></marker></defs>
      <g data-linhas></g>
    </svg>
    <ul class="roda-tipos">
      ${ORDEM_TIPOS.map((t, i) => {
        const l = lugarNaRoda(i, ORDEM_TIPOS.length);
        return `<li style="left:${l.x.toFixed(2)}%;top:${l.y.toFixed(2)}%"><button type="button" class="tipo roda-tipo" data-tipo="${semAcento(t)}" data-nome="${t}" aria-label="${nomeDoTipo(t)}" aria-pressed="false"><span class="roda-nome" aria-hidden="true">${nomeDoTipo(t)}</span><span class="roda-sigla" aria-hidden="true">${nomeDoTipo(t).slice(0, 3)}</span></button></li>`;
      }).join("\n      ")}
    </ul>
    <p class="roda-centro" data-centro aria-hidden="true"></p>
  </div>
  <div class="roda-leitura" data-leitura aria-live="polite"></div>
  <p class="roda-chave nota-editorial"><span class="roda-traco roda-traco-cheio"></span>${b("atinge em dobro", "hits for double")} <span class="roda-traco roda-traco-tracejado"></span>${b("apanha em dobro de", "takes double from")}</p>
</section>`;
  return moldura({
    titulo: b("Roda de tipos", "Type wheel"), caminho: "/tipos/", classe: "pagina-tipos", corpo, modulo: "tipos-roda",
    descricao: b("Os 18 tipos de Pokémon numa roda: escolha um e veja quem ele atinge em dobro, de quem ele apanha, a que resiste e o que não faz efeito.", "The 18 Pokémon types on a wheel: pick one and see what it hits for double damage, what hits it, what it resists and what has no effect.")
  });
}

/* ---------- desenhar o perfil ---------- */

export function paginaDesenhar() {
  const INICIAL = 3;
  const corpo = `
<section class="cabecalho">
  <p class="migalha"><a href="/bussola/">${b("Bússola", "Compass")}</a></p>
  <h1>${b("Desenhe o seu perfil", "Draw your profile")}</h1>
  <p class="prosa">${b("Arraste cada vértice até onde você quer, do centro (nada) à borda (tudo). A lista ao lado se reordena na hora, com os jogos de perfil mais parecido no alto.", "Drag each vertex as far as you want, from the center (nothing) to the edge (everything). The list beside it reorders right away, with the games of the closest profile at the top.")}</p>
</section>
<section class="desenhar" data-desenhar>
  ${semJs(b('Para desenhar o perfil é preciso JavaScript. A <a href="/linha-do-tempo/">linha do tempo</a> mostra o perfil de todos os jogos sem ele.', 'Drawing the profile needs JavaScript. The <a href="/linha-do-tempo/">timeline</a> shows the profile of every game without it.'))}
  <figure class="desenhar-hex">
    <div class="hex-vivo">
      <canvas aria-hidden="true"></canvas>
      ${EIXOS.map((e) => {
        const a = (e.ang * Math.PI) / 180, r = 44 * alcance(INICIAL);
        return `<span class="hex-eixo" data-eixo="${e.id}" style="left:${(50 + Math.cos(a) * 56).toFixed(1)}%;top:${(50 + Math.sin(a) * 56).toFixed(1)}%">${eixoAqui(e)}</span>
      <button type="button" class="hex-pega" role="slider" data-eixo="${e.id}" data-angulo="${e.ang}" aria-label="${eixoAqui(e)}" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${INICIAL}" aria-valuetext="${b(`${INICIAL} de 5`, `${INICIAL} out of 5`)}" style="left:${(50 + Math.cos(a) * r).toFixed(2)}%;top:${(50 + Math.sin(a) * r).toFixed(2)}%"></button>`;
      }).join("\n      ")}
    </div>
    <figcaption>
      <button type="button" class="botao botao-contorno botao-pequeno" data-zerar>${b("Começar de novo", "Start over")}</button>
      <button type="button" class="ligacao" data-copiar>${b("Copiar o link deste perfil", "Copy the link to this profile")}</button>
      <span class="nota-editorial" data-aviso aria-live="polite"></span>
    </figcaption>
  </figure>
  <div class="desenhar-lista">
    <h2>${b("Os mais parecidos", "The closest ones")}</h2>
    <p class="nota-editorial">${b("Afinidade entre a forma que você desenhou e a de cada jogo. É a mesma conta da bússola.", "Affinity between the shape you drew and that of each game. It is the same math as the compass.")}</p>
    <ol data-lista>
      ${ORDENADOS.map(aqui).map((j) => `<li data-slug="${j.slug}"><a href="/jogos/${j.slug}/"><img class="hex" src="/hex/${j.slug}.svg" alt="" width="64" height="64" loading="lazy" decoding="async"><span class="desenhar-jogo"><span class="hex-nome">${esc(j.curto)}</span><span class="hex-meta">${esc(j.chamada)}</span></span></a><span class="desenhar-afinidade"><span class="desenhar-trilho" aria-hidden="true"><span data-barra></span></span><b data-valor></b></span></li>`).join("\n      ")}
    </ol>
    <p><button type="button" class="ligacao" data-todos aria-expanded="false">${b(`Ver os ${ORDENADOS.length} jogos`, `See all ${ORDENADOS.length} games`)}</button></p>
  </div>
</section>`;
  return moldura({
    titulo: b("Desenhe o seu perfil", "Draw your profile"), caminho: "/desenhar/", classe: "pagina-desenhar", corpo, modulo: "desenhar",
    descricao: b("Arraste os seis vértices do hexágono e veja, na hora, quais jogos de Pokémon têm o perfil mais parecido com o que você desenhou.", "Drag the six vertices of the hexagon and see, right away, which Pokémon games have the profile closest to what you drew.")
  });
}
