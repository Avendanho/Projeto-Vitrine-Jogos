/* As ferramentas da edição Pokémon: comparar dois Pokémon, o quiz diário, o montador de time e o diário
 * de desafio. Aqui só nasce a moldura de cada página; quem a faz funcionar é o módulo de mesmo nome em src/js/. */
import { moldura } from "./paginas.mjs";

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
