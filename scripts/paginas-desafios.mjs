/* Desafios: a lista, a página de cada desafio escrito e os dados da roleta,
 * nas duas edições do atlas. O conteúdo fica em dados/desafios.mjs. */
import { DESAFIOS, APRESENTACAO, ROLETA } from "../dados/desafios.mjs";
import { JOGOS } from "../dados/jogos.mjs";
import { REGIOES } from "../dados/atlas.mjs";
import { POKEDEX, FICHAS, esc, enderecoEspecie } from "./base.mjs";
import { moldura } from "./paginas.mjs";
import { slot, dadosDaRoletaCobblemon } from "./paginas-cobblemon.mjs";
import { enderecoDoDiario } from "./paginas-ferramentas.mjs";
import { b, ingles } from "./lingua.mjs";
import { LINGUAS } from "./textos.mjs";
import { DESAFIOS_EN, APRESENTACAO_EN, ROLETA_EN } from "../dados/en-desafios.mjs";
import { FICHA_EN } from "../dados/en.mjs";

/* O desafio com os textos na língua da página. */
const aqui = (d) => (ingles() ? { ...d, ...DESAFIOS_EN[d.slug] } : d);
const jogoAqui = (j) => (ingles() ? LINGUAS.en.jogo(j) : j);

const RAIZ = { pokemon: "/desafios/", cobblemon: "/cobblemon/desafios/" };
const doEdicao = (edicao) => DESAFIOS.filter((d) => d.edicao === edicao);
const endereco = (d) => `${RAIZ[d.edicao]}${d.slug}/`;
const regiao = (d) => REGIOES.find((r) => r.id === d.regiao);
const jogo = (slug) => JOGOS.find((j) => j.slug === slug);

/* Uma medida de 1 a 5, no mesmo desenho das notas dos jogos. */
function medida(rotulo, valor) {
  return `<span class="medida"><span class="medida-rotulo">${rotulo}</span><span class="estratos" role="img" aria-label="${rotulo}: ${valor} ${b("de", "out of")} 5">${[1, 2, 3, 4, 5].map((n) => `<span class="estrato${n <= valor ? ` estrato-${n}` : ""}"></span>`).join("")}</span></span>`;
}

/* A arte de um desafio: gravuras na edição Pokémon, pixel na edição Cobblemon. */
function elenco(d, lado = 92) {
  if (d.edicao === "cobblemon") return `<span class="fileira">${d.especies.map((n) => slot(n, { lado: Math.min(lado, 64) })).join("")}</span>`;
  return `<span class="elenco">${d.especies.map((n) => `<a href="${enderecoEspecie(n)}" title="${esc(FICHAS[n].nome)}" aria-label="${esc(FICHAS[n].nome)}"><img src="/arte/mini/${n}.webp" alt="" width="${lado}" height="${lado}" loading="lazy" decoding="async"></a>`).join("")}</span>`;
}

function cartao(original) {
  const d = aqui(original), r = regiao(d);
  return `<li class="desafio-cartao painel" data-slug="${d.slug}">
    ${elenco(d, 76)}
    <h3><a href="${endereco(d)}">${esc(d.nome)}</a></h3>
    <p class="desafio-tema">${esc(d.tema)}</p>
    <p class="desafio-medidas">${r ? `<span class="desafio-regiao">${r.nome}</span>` : ""}${medida(b("Dificuldade", "Difficulty"), d.dificuldade)}${medida(b("Caos", "Chaos"), d.caos)}</p>
  </li>`;
}

/* ---------- a lista ---------- */

export function paginaDesafios(edicao) {
  const lista = doEdicao(edicao), cobblemon = edicao === "cobblemon";
  const corpo = `
<section class="cabecalho">
  <h1>${b("Desafios", "Challenges")}</h1>
  <div class="prosa">
    ${b(APRESENTACAO, APRESENTACAO_EN)[edicao].map((p) => `<p>${esc(p)}</p>`).join("\n    ")}
  </div>
</section>

<section class="desafios" aria-labelledby="t-escritos">
  <div class="desafios-topo">
    <h2 id="t-escritos">${cobblemon ? b("Para começar um mundo novo", "To start a new world") : b("Um para cada região", "One for each region")}</h2>
    <button type="button" class="botao botao-contorno" data-sortear-escrito>${b("Sortear um destes", "Draw one of these")}</button>
  </div>
  <ul class="desafios-lista" data-embaralhar>
    ${lista.map(cartao).join("\n    ")}
  </ul>
</section>

<section class="roleta" id="roleta" aria-labelledby="t-roleta" data-roleta="${edicao}">
  <div class="roleta-texto">
    <h2 id="t-roleta">${b("A roleta", "The roulette")}</h2>
    <p class="prosa">${cobblemon
      ? b("Nenhum dos de cima serviu? A roleta monta um desafio novo: sorteia um ambiente do mundo, uma regra para o time, uma ou duas complicações e uma condição de vitória.", "None of the above worked for you? The roulette builds a new challenge: it draws an environment of the world, a rule for the team, one or two complications and a win condition.")
      : b("Nenhum dos de cima serviu? A roleta monta um desafio novo: sorteia um jogo, uma regra para o time, uma ou duas complicações e uma condição de vitória. As espécies e os tipos sorteados existem na Pokédex daquele jogo.", "None of the above worked for you? The roulette builds a new challenge: it draws a game, a rule for the team, one or two complications and a win condition. The species and types drawn exist in that game's Pokédex.")}</p>
    <div class="roleta-acoes">
      <button type="button" class="botao" data-girar>${b("Girar a roleta", "Spin the roulette")}</button>
      <button type="button" class="ligacao" data-copiar hidden>${b("Copiar o link deste desafio", "Copy the link to this challenge")}</button>
      <span class="so-leitor" aria-live="polite" data-copiado></span>
    </div>
    ${cobblemon ? "" : `<p class="roleta-diario"><a class="ligacao" href="/diario/" data-diario-link>${b("Acompanhar uma campanha no diário", "Track a run in the journal")}</a></p>`}
  </div>
  <article class="roleta-resultado painel" data-resultado aria-live="polite">
    <p class="roleta-vazio">${b("O desafio sorteado aparece aqui. Cada um tem um link próprio, para você mandar o mesmo a um amigo.", "The challenge drawn shows up here. Each one has its own link, so you can send the same one to a friend.")}</p>
    <noscript><p>${b("A roleta precisa de JavaScript. Os desafios escritos, acima, funcionam sem ele.", "The roulette needs JavaScript. The written challenges, above, work without it.")}</p></noscript>
  </article>
</section>`;

  return moldura({
    edicao, titulo: cobblemon ? b("Desafios de Cobblemon", "Cobblemon challenges") : b("Desafios", "Challenges"), caminho: RAIZ[edicao], classe: "pagina-desafios", corpo, modulo: "roleta",
    espelho: RAIZ[cobblemon ? "pokemon" : "cobblemon"],
    descricao: cobblemon
      ? b(`${lista.length} desafios para começar um mundo novo de Cobblemon, e uma roleta que sorteia outros.`, `${lista.length} challenges to start a new Cobblemon world, and a roulette that draws others.`)
      : b(`${lista.length} maneiras alternativas de jogar Pokémon, uma para cada região, e uma roleta que sorteia desafios novos.`, `${lista.length} alternative ways to play Pokémon, one for each region, and a roulette that draws new challenges.`)
  });
}

/* ---------- a página de um desafio ---------- */

export function paginaDesafio(original) {
  const d = aqui(original), lista = doEdicao(d.edicao), i = lista.indexOf(original);
  const anterior = lista[i - 1] && aqui(lista[i - 1]), proximo = lista[i + 1] && aqui(lista[i + 1]);
  const r = regiao(d), jogos = (d.jogos || []).map(jogo).filter(Boolean).map(jogoAqui);
  const cobblemon = d.edicao === "cobblemon";

  const corpo = `
<article class="desafio">
  <header class="desafio-topo">
    <div>
      <p class="migalha"><a href="${RAIZ[d.edicao]}">${b("Desafios", "Challenges")}</a></p>
      <h1>${esc(d.nome)}</h1>
      <p class="desafio-tema">${esc(d.tema)}</p>
      <dl class="ficha-tecnica desafio-ficha">
        ${r ? `<div><dt>${b("Região recomendada", "Recommended region")}</dt><dd><a href="/regioes/${r.id}/">${r.nome}</a></dd></div>` : ""}
        ${jogos.length ? `<div><dt>${jogos.length > 1 ? b("Jogos", "Games") : b("Jogo", "Game")}</dt><dd>${jogos.map((j) => `<a href="/jogos/${j.slug}/">${esc(j.curto)}</a>`).join(b(" ou ", " or "))}</dd></div>` : ""}
        ${cobblemon ? `<div><dt>${b("Onde", "Where")}</dt><dd>${b("Um mundo novo de Cobblemon", "A new Cobblemon world")}</dd></div>` : ""}
        <div><dt>${b("Dificuldade", "Difficulty")}</dt><dd>${medida(b("Dificuldade", "Difficulty"), d.dificuldade)}</dd></div>
        <div><dt>${b("Caos", "Chaos")}</dt><dd>${medida(b("Caos", "Chaos"), d.caos)}</dd></div>
      </dl>
    </div>
    <div class="desafio-elenco">${elenco(d, 150)}</div>
  </header>

  <section class="desafio-sinopse" aria-labelledby="t-sinopse">
    <h2 id="t-sinopse">${b("Sinopse", "Synopsis")}</h2>
    <div class="prosa">
      ${d.sinopse.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </div>
    <p class="desafio-objetivo">${esc(d.objetivo)}</p>
  </section>

  ${d.blocos.map((b, k) => `<section aria-labelledby="t-bloco-${k}">
    <h2 id="t-bloco-${k}">${esc(b.titulo)}</h2>
    ${b.itens ? `<ol class="desafio-regras">${b.itens.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>` : `<p class="prosa">${esc(b.texto)}</p>`}
  </section>`).join("\n\n  ")}

  <section class="desafio-fim" aria-labelledby="t-fim">
    <h2 id="t-fim" class="so-leitor">${b("Como termina", "How it ends")}</h2>
    <dl>
      <div class="painel"><dt>${b("Vitória", "Win")}</dt><dd>${esc(d.vitoria)}</dd></div>
      <div class="painel"><dt>${b("Derrota", "Loss")}</dt><dd>${esc(d.derrota)}</dd></div>
      ${d.variacao ? `<div class="painel"><dt>${b("Para variar", "For a change")}</dt><dd>${esc(d.variacao)}</dd></div>` : ""}
    </dl>
  </section>

  ${cobblemon ? "" : `<section class="desafio-outro">
    <p class="prosa">${b("Vai encarar? O diário guarda as capturas, o time e quem caiu, com estas regras já anotadas.", "Up for it? The journal keeps the catches, the team and who fell, with these rules already written down.")}</p>
    <a class="botao" href="${esc(enderecoDoDiario({ nome: d.nome, jogo: jogos[0]?.slug, regras: [d.objetivo, ...d.blocos.flatMap((bloco) => (bloco.itens ? bloco.itens : [bloco.texto]))].join("\n") }))}">${b("Acompanhar no diário", "Track it in the journal")}</a>
  </section>`}

  <section class="desafio-outro">
    <p class="prosa">${b("Quer outra coisa? A roleta sorteia um desafio novo a cada giro.", "Want something else? The roulette draws a new challenge with every spin.")}</p>
    <a class="botao botao-contorno" href="${RAIZ[d.edicao]}#roleta">${b("Girar a roleta", "Spin the roulette")}</a>
  </section>

  <nav class="jogo-passos" aria-label="${b("Outros desafios", "Other challenges")}">
    ${anterior ? `<a href="${endereco(anterior)}"><span>${b("Desafio anterior", "Previous challenge")}</span>${esc(anterior.nome)}</a>` : "<span></span>"}
    ${proximo ? `<a href="${endereco(proximo)}"><span>${b("Próximo desafio", "Next challenge")}</span>${esc(proximo.nome)}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    edicao: d.edicao, titulo: b(`${d.nome}, um desafio${r ? ` para ${r.nome}` : " de Cobblemon"}`, `${d.nome}, a challenge${r ? ` for ${r.nome}` : " for Cobblemon"}`), caminho: endereco(d), classe: "pagina-desafio", corpo,
    espelho: RAIZ[cobblemon ? "pokemon" : "cobblemon"],
    descricao: `${d.objetivo} ${d.tema}`
  });
}

export const TODOS_OS_DESAFIOS = DESAFIOS;
export const enderecoDoDesafio = endereco;

/* ---------- dados para a roleta ----------
 * Um módulo por edição, com as peças de dados/desafios.mjs e o que o sorteio
 * precisa saber do atlas: quais espécies cada jogo tem, de que tipo e de que cor. */
/* As peças com o texto em inglês: a ordem, os pesos e as chaves são os do original. */
function pecasEmIngles(edicao) {
  const pt = ROLETA[edicao], en = ROLETA_EN[edicao];
  return {
    regras: pt.regras.map((r, i) => ({ ...r, ...en.regras[i] })),
    complicacoes: pt.complicacoes.map((c, i) => ({ ...c, texto: en.complicacoes[i] })),
    temas: en.temas,
    vitorias: pt.vitorias.map((v, i) => ({ ...v, texto: en.vitorias[i] })),
    derrotas: en.derrotas
  };
}

export function dadosDaRoleta(edicao) {
  let mundo;
  if (edicao === "cobblemon") {
    mundo = dadosDaRoletaCobblemon();
  } else {
    const campanhas = JOGOS.filter((j) => j.pokedex && j.tipo !== "derivado");
    const usadas = new Set();
    const jogos = campanhas.map((j) => {
      const ids = [...new Set(j.pokedex.flatMap(([lista]) => POKEDEX.dex[lista].map(([, e]) => e)))];
      for (const id of ids) usadas.add(id);
      return { slug: j.slug, nome: jogoAqui(j).curto, regiao: REGIOES.find((r) => r.id === j.regiao).nome, especies: ids };
    });
    // por espécie: nome, tipos, cor e se é lendária ou mítica (essas não viram capitão nem entram no time sorteado)
    mundo = { jogos, especies: Object.fromEntries([...usadas].sort((a, b) => a - b).map((id) => [id, [FICHAS[id].nome, POKEDEX.especies[id][1], FICHAS[id].cor, FICHAS[id].classe === "lendario" || FICHAS[id].classe === "mitico" ? 1 : 0]])) };
  }
  return `/* Gerado por scripts/build.mjs a partir de dados/. Não edite à mão. */
export const EDICAO = ${JSON.stringify(edicao)};
export const PECAS = ${JSON.stringify(ingles() ? pecasEmIngles(edicao) : ROLETA[edicao])};
export const MUNDO = ${JSON.stringify(ingles() ? { ...mundo, cores: FICHA_EN.cor } : mundo)};
export const ESCRITOS = ${JSON.stringify(doEdicao(edicao).map((d) => endereco(d)))};
`;
}
