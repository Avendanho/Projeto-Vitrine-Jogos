/* As ferramentas da edição Pokémon: comparar dois Pokémon, o montador de time e o diário
 * de desafio. Aqui só nasce a moldura de cada página; quem a faz funcionar é o módulo de mesmo nome em src/js/. */
import { moldura } from "./paginas.mjs";
import { esc, enumerar, TIPOS_E_FATORES, ENCONTROS } from "./base.mjs";
import { JOGOS } from "../dados/jogos.mjs";
import { jogosParaONavegador } from "./dados-navegador.mjs";

export const ATRIBUTOS = ["PS", "Ataque", "Defesa", "Ataque Especial", "Defesa Especial", "Velocidade"];
const semJs = (texto) => `<noscript><p class="prosa">${texto}</p></noscript>`;

/* ---------- comparar dois Pokémon ---------- */

export function paginaCompararPokemon() {
  const campo = (lado, rotulo) => `<div class="dex-busca"><label for="duelo-${lado}">${rotulo}</label><input id="duelo-${lado}" name="${lado}" type="search" list="lista-especies" placeholder="Nome ou número" autocomplete="off" spellcheck="false"></div>`;
  const corpo = `
<section class="cabecalho">
  <p class="migalha"><a href="/comparar/">Comparar</a></p>
  <h1>Comparar Pokémon</h1>
  <p class="prosa">Escolha dois Pokémon e veja os atributos de base frente a frente. Em cada linha, a barra de quem leva vantagem fica em vermelho.</p>
</section>
<section class="duelo" data-duelo>
  ${semJs('O comparador precisa de JavaScript. Sem ele, a página de cada espécie, a partir da <a href="/pokedex/">Pokédex</a>, traz os mesmos atributos.')}
  <form class="duelo-campos" role="search" aria-label="Pokémon a comparar">
    ${campo("a", "De um lado")}
    <button type="button" class="ligacao" data-trocar>Trocar de lado</button>
    ${campo("b", "Do outro")}
    <datalist id="lista-especies"></datalist>
  </form>
  <div class="duelo-palco">
    <article class="duelo-lado" data-lado="a" aria-live="polite"></article>
    <ol class="duelo-atributos" aria-label="Atributos de base">
      ${ATRIBUTOS.map((nome) => `<li><span class="duelo-valor" data-valor="a"></span><span class="duelo-trilho duelo-trilho-a" aria-hidden="true"><span class="duelo-barra" data-barra="a"></span></span><span class="duelo-nome">${nome}</span><span class="duelo-trilho" aria-hidden="true"><span class="duelo-barra" data-barra="b"></span></span><span class="duelo-valor" data-valor="b"></span></li>`).join("\n      ")}
      <li class="duelo-total"><span class="duelo-valor" data-valor="a"></span><span></span><span class="duelo-nome">Total</span><span></span><span class="duelo-valor" data-valor="b"></span></li>
    </ol>
    <article class="duelo-lado" data-lado="b" aria-live="polite"></article>
  </div>
</section>`;
  return moldura({
    titulo: "Comparar dois Pokémon", caminho: "/comparar/pokemon/", classe: "pagina-duelo", corpo, modulo: "comparar-pokemon",
    descricao: "Dois Pokémon frente a frente: atributos de base, tipos, altura e peso, com a vantagem de cada linha em destaque."
  });
}

/* ---------- montador de time ---------- */

export function paginaTime() {
  const jogos = jogosParaONavegador();
  const corpo = `
<section class="cabecalho">
  <h1>Montar um time</h1>
  <p class="prosa">Escolha até seis Pokémon e veja de que o time apanha, a que ele resiste e o que ele não consegue atingir com vantagem. Se você escolher um jogo, as sugestões ficam só com o que existe na Pokédex dele.</p>
</section>
<section class="time" data-time>
  ${semJs('O montador de time precisa de JavaScript. A <a href="/pokedex/">Pokédex</a> mostra os tipos de cada espécie sem ele.')}
  <form class="time-controles" aria-label="Montar o time">
    <label class="escolha"><span>Jogo</span><select name="jogo"><option value="">Qualquer jogo</option>${jogos.map((j) => `<option value="${j.slug}">${esc(j.nome)}</option>`).join("")}</select></label>
    <div class="dex-busca"><label for="time-campo">Pôr no time</label><input id="time-campo" type="search" list="lista-time" placeholder="Nome ou número" autocomplete="off" spellcheck="false"></div>
    <button type="submit" class="botao">Adicionar</button>
    <button type="button" class="ligacao" data-limpar hidden>Esvaziar o time</button>
    <p class="time-aviso" data-aviso aria-live="polite"></p>
    <datalist id="lista-time"></datalist>
  </form>
  <ol class="time-vagas" data-vagas aria-label="O time"></ol>
  <div class="time-resumo" data-resumo aria-live="polite"></div>
  <div class="time-tabela-caixa">
    <table class="time-tabela" data-tabela hidden>
      <caption class="so-leitor">Quanto cada Pokémon do time recebe de golpes de cada tipo</caption>
      <thead><tr><th scope="col">Recebendo golpe de</th>${TIPOS_E_FATORES.tipos.map((t) => `<th scope="col"><abbr title="${t}">${t.slice(0, 3)}</abbr></th>`).join("")}</tr></thead>
      <tbody></tbody>
      <tfoot></tfoot>
    </table>
  </div>
  <p class="nota-editorial">Cada coluna é o tipo de um golpe recebido. 2 e 4: apanha em dobro ou em quádruplo. ½ e ¼: resiste. 0: é imune. Casa vazia: dano normal. A conta olha só os tipos; habilidades e itens ficam de fora.</p>
</section>`;
  return moldura({
    titulo: "Montar um time de Pokémon", caminho: "/time/", classe: "pagina-time", corpo, modulo: "time",
    descricao: "Monte um time de até seis Pokémon e veja fraquezas, resistências e o que falta cobrir, com filtro pela Pokédex de cada jogo."
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
