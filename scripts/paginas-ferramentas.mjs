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

/* ---------- quiz diário ---------- */

export function paginaQuiz() {
  const colunas = ["Tipo 1", "Tipo 2", "Geração", "Cor", "Estágio", "Altura", "Peso"];
  const corpo = `
<section class="cabecalho">
  <h1>Quem é esse Pokémon?</h1>
  <p class="prosa">Dois enigmas por dia, iguais para todo mundo. Pela ficha, cada palpite mostra o que ele tem em comum com o Pokémon do dia. Pela gravura, a tinta aparece aos poucos, e você tem seis chances.</p>
</section>
<section class="quiz" data-quiz>
  ${semJs('O quiz precisa de JavaScript. A <a href="/pokedex/">Pokédex</a> funciona sem ele.')}
  <div class="quiz-topo">
    <div class="quiz-modos" role="group" aria-label="Enigma">
      <button type="button" class="ficha" data-modo="ficha" aria-pressed="true">Pela ficha</button>
      <button type="button" class="ficha" data-modo="gravura" aria-pressed="false">Pela gravura</button>
    </div>
    <p class="quiz-dia">Enigma nº <strong data-numero></strong> <span data-restam></span> <span data-sequencia></span></p>
  </div>
  <div class="quiz-gravura" data-gravura hidden><canvas width="560" height="560" role="img" aria-label="Gravura do Pokémon do dia"></canvas></div>
  <form class="quiz-palpite" data-form>
    <div class="dex-busca"><label for="quiz-campo">Seu palpite</label><input id="quiz-campo" type="search" list="lista-especies" placeholder="Nome do Pokémon" autocomplete="off" spellcheck="false"></div>
    <button type="submit" class="botao">Palpitar</button>
    <p class="quiz-aviso" data-aviso aria-live="polite"></p>
    <datalist id="lista-especies"></datalist>
  </form>
  <div class="quiz-fim" data-fim aria-live="polite" hidden></div>
  <div class="quiz-tabela-caixa">
    <table class="quiz-tabela" data-tabela hidden>
      <caption class="so-leitor">Seus palpites, do mais recente para o mais antigo</caption>
      <thead><tr><th scope="col">Palpite</th>${colunas.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <ol class="quiz-palpites" data-lista hidden></ol>
  <p class="nota-editorial" data-legenda>Casa cheia: bate com o Pokémon do dia. Casa riscada: o tipo existe nele, mas em outro lugar. Casa vazia: não bate. A seta diz se o do dia tem mais ou menos. Estágio é a posição na linha evolutiva.</p>
</section>`;
  return moldura({
    titulo: "Quem é esse Pokémon? O quiz diário", caminho: "/quiz/", classe: "pagina-quiz", corpo, modulo: "quiz",
    descricao: "Dois enigmas de Pokémon por dia, iguais para todo mundo: adivinhe pela ficha ou pela gravura que se revela aos poucos."
  });
}
