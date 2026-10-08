/* Desafios: a lista, a página de cada desafio escrito e os dados da roleta,
 * nas duas edições do atlas. O conteúdo fica em dados/desafios.mjs. */
import { DESAFIOS, APRESENTACAO, ROLETA } from "../dados/desafios.mjs";
import { JOGOS } from "../dados/jogos.mjs";
import { REGIOES } from "../dados/atlas.mjs";
import { POKEDEX, FICHAS, esc, enderecoEspecie } from "./base.mjs";
import { moldura } from "./paginas.mjs";
import { slot, dadosDaRoletaCobblemon } from "./paginas-cobblemon.mjs";
import { enderecoDoDiario } from "./paginas-ferramentas.mjs";

const RAIZ = { pokemon: "/desafios/", cobblemon: "/cobblemon/desafios/" };
const doEdicao = (edicao) => DESAFIOS.filter((d) => d.edicao === edicao);
const endereco = (d) => `${RAIZ[d.edicao]}${d.slug}/`;
const regiao = (d) => REGIOES.find((r) => r.id === d.regiao);
const jogo = (slug) => JOGOS.find((j) => j.slug === slug);

/* Uma medida de 1 a 5, no mesmo desenho das notas dos jogos. */
function medida(rotulo, valor) {
  return `<span class="medida"><span class="medida-rotulo">${rotulo}</span><span class="estratos" role="img" aria-label="${rotulo}: ${valor} de 5">${[1, 2, 3, 4, 5].map((n) => `<span class="estrato${n <= valor ? ` estrato-${n}` : ""}"></span>`).join("")}</span></span>`;
}

/* A arte de um desafio: gravuras na edição Pokémon, pixel na edição Cobblemon. */
function elenco(d, lado = 92) {
  if (d.edicao === "cobblemon") return `<span class="fileira">${d.especies.map((n) => slot(n, { lado: Math.min(lado, 64) })).join("")}</span>`;
  return `<span class="elenco">${d.especies.map((n) => `<a href="${enderecoEspecie(n)}" title="${esc(FICHAS[n].nome)}" aria-label="${esc(FICHAS[n].nome)}"><img src="/arte/mini/${n}.webp" alt="" width="${lado}" height="${lado}" loading="lazy" decoding="async"></a>`).join("")}</span>`;
}

function cartao(d) {
  const r = regiao(d);
  return `<li class="desafio-cartao painel" data-slug="${d.slug}">
    ${elenco(d, 76)}
    <h3><a href="${endereco(d)}">${esc(d.nome)}</a></h3>
    <p class="desafio-tema">${esc(d.tema)}</p>
    <p class="desafio-medidas">${r ? `<span class="desafio-regiao">${r.nome}</span>` : ""}${medida("Dificuldade", d.dificuldade)}${medida("Caos", d.caos)}</p>
  </li>`;
}

/* ---------- a lista ---------- */

export function paginaDesafios(edicao) {
  const lista = doEdicao(edicao), cobblemon = edicao === "cobblemon";
  const corpo = `
<section class="cabecalho">
  <h1>Desafios</h1>
  <div class="prosa">
    ${APRESENTACAO[edicao].map((p) => `<p>${esc(p)}</p>`).join("\n    ")}
  </div>
</section>

<section class="desafios" aria-labelledby="t-escritos">
  <div class="desafios-topo">
    <h2 id="t-escritos">${cobblemon ? "Para começar um mundo novo" : "Um para cada região"}</h2>
    <button type="button" class="botao botao-contorno" data-sortear-escrito>Sortear um destes</button>
  </div>
  <ul class="desafios-lista" data-embaralhar>
    ${lista.map(cartao).join("\n    ")}
  </ul>
</section>

<section class="roleta" id="roleta" aria-labelledby="t-roleta" data-roleta="${edicao}">
  <div class="roleta-texto">
    <h2 id="t-roleta">A roleta</h2>
    <p class="prosa">${cobblemon
      ? "Nenhum dos de cima serviu? A roleta monta um desafio novo: sorteia um ambiente do mundo, uma regra para o time, uma ou duas complicações e uma condição de vitória."
      : "Nenhum dos de cima serviu? A roleta monta um desafio novo: sorteia um jogo, uma regra para o time, uma ou duas complicações e uma condição de vitória. As espécies e os tipos sorteados existem na Pokédex daquele jogo."}</p>
    <div class="roleta-acoes">
      <button type="button" class="botao" data-girar>Girar a roleta</button>
      <button type="button" class="ligacao" data-copiar hidden>Copiar o link deste desafio</button>
      <span class="so-leitor" aria-live="polite" data-copiado></span>
    </div>
    ${cobblemon ? "" : '<p class="roleta-diario"><a class="ligacao" href="/diario/" data-diario-link>Acompanhar uma campanha no diário</a></p>'}
  </div>
  <article class="roleta-resultado painel" data-resultado aria-live="polite">
    <p class="roleta-vazio">O desafio sorteado aparece aqui. Cada um tem um link próprio, para você mandar o mesmo a um amigo.</p>
    <noscript><p>A roleta precisa de JavaScript. Os desafios escritos, acima, funcionam sem ele.</p></noscript>
  </article>
</section>`;

  return moldura({
    edicao, titulo: cobblemon ? "Desafios de Cobblemon" : "Desafios", caminho: RAIZ[edicao], classe: "pagina-desafios", corpo, modulo: "roleta",
    espelho: RAIZ[cobblemon ? "pokemon" : "cobblemon"],
    descricao: cobblemon
      ? `${lista.length} desafios para começar um mundo novo de Cobblemon, e uma roleta que sorteia outros.`
      : `${lista.length} maneiras alternativas de jogar Pokémon, uma para cada região, e uma roleta que sorteia desafios novos.`
  });
}

/* ---------- a página de um desafio ---------- */

export function paginaDesafio(d) {
  const lista = doEdicao(d.edicao), i = lista.indexOf(d);
  const anterior = lista[i - 1], proximo = lista[i + 1];
  const r = regiao(d), jogos = (d.jogos || []).map(jogo).filter(Boolean);
  const cobblemon = d.edicao === "cobblemon";

  const corpo = `
<article class="desafio">
  <header class="desafio-topo">
    <div>
      <p class="migalha"><a href="${RAIZ[d.edicao]}">Desafios</a></p>
      <h1>${esc(d.nome)}</h1>
      <p class="desafio-tema">${esc(d.tema)}</p>
      <dl class="ficha-tecnica desafio-ficha">
        ${r ? `<div><dt>Região recomendada</dt><dd><a href="/regioes/${r.id}/">${r.nome}</a></dd></div>` : ""}
        ${jogos.length ? `<div><dt>${jogos.length > 1 ? "Jogos" : "Jogo"}</dt><dd>${jogos.map((j) => `<a href="/jogos/${j.slug}/">${esc(j.curto)}</a>`).join(" ou ")}</dd></div>` : ""}
        ${cobblemon ? `<div><dt>Onde</dt><dd>Um mundo novo de Cobblemon</dd></div>` : ""}
        <div><dt>Dificuldade</dt><dd>${medida("Dificuldade", d.dificuldade)}</dd></div>
        <div><dt>Caos</dt><dd>${medida("Caos", d.caos)}</dd></div>
      </dl>
    </div>
    <div class="desafio-elenco">${elenco(d, 150)}</div>
  </header>

  <section class="desafio-sinopse" aria-labelledby="t-sinopse">
    <h2 id="t-sinopse">Sinopse</h2>
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
    <h2 id="t-fim" class="so-leitor">Como termina</h2>
    <dl>
      <div class="painel"><dt>Vitória</dt><dd>${esc(d.vitoria)}</dd></div>
      <div class="painel"><dt>Derrota</dt><dd>${esc(d.derrota)}</dd></div>
      ${d.variacao ? `<div class="painel"><dt>Para variar</dt><dd>${esc(d.variacao)}</dd></div>` : ""}
    </dl>
  </section>

  ${cobblemon ? "" : `<section class="desafio-outro">
    <p class="prosa">Vai encarar? O diário guarda as capturas, o time e quem caiu, com estas regras já anotadas.</p>
    <a class="botao" href="${esc(enderecoDoDiario({ nome: d.nome, jogo: jogos[0]?.slug, regras: [d.objetivo, ...d.blocos.flatMap((b) => (b.itens ? b.itens : [b.texto]))].join("\n") }))}">Acompanhar no diário</a>
  </section>`}

  <section class="desafio-outro">
    <p class="prosa">Quer outra coisa? A roleta sorteia um desafio novo a cada giro.</p>
    <a class="botao botao-contorno" href="${RAIZ[d.edicao]}#roleta">Girar a roleta</a>
  </section>

  <nav class="jogo-passos" aria-label="Outros desafios">
    ${anterior ? `<a href="${endereco(anterior)}"><span>Desafio anterior</span>${esc(anterior.nome)}</a>` : "<span></span>"}
    ${proximo ? `<a href="${endereco(proximo)}"><span>Próximo desafio</span>${esc(proximo.nome)}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    edicao: d.edicao, titulo: `${d.nome}, um desafio${r ? ` para ${r.nome}` : " de Cobblemon"}`, caminho: endereco(d), classe: "pagina-desafio", corpo,
    espelho: RAIZ[cobblemon ? "pokemon" : "cobblemon"],
    descricao: `${d.objetivo} ${d.tema}`
  });
}

export const TODOS_OS_DESAFIOS = DESAFIOS;
export const enderecoDoDesafio = endereco;

/* ---------- dados para a roleta ----------
 * Um módulo por edição, com as peças de dados/desafios.mjs e o que o sorteio
 * precisa saber do atlas: quais espécies cada jogo tem, de que tipo e de que cor. */
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
      return { slug: j.slug, nome: j.curto, regiao: REGIOES.find((r) => r.id === j.regiao).nome, especies: ids };
    });
    // por espécie: nome, tipos, cor e se é lendária ou mítica (essas não viram capitão nem entram no time sorteado)
    mundo = { jogos, especies: Object.fromEntries([...usadas].sort((a, b) => a - b).map((id) => [id, [FICHAS[id].nome, POKEDEX.especies[id][1], FICHAS[id].cor, FICHAS[id].classe === "lendario" || FICHAS[id].classe === "mitico" ? 1 : 0]])) };
  }
  return `/* Gerado por scripts/build.mjs a partir de dados/. Não edite à mão. */
export const EDICAO = ${JSON.stringify(edicao)};
export const PECAS = ${JSON.stringify(ROLETA[edicao])};
export const MUNDO = ${JSON.stringify(mundo)};
export const ESCRITOS = ${JSON.stringify(doEdicao(edicao).map((d) => endereco(d)))};
`;
}
