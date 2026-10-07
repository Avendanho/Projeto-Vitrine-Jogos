/* Modelos das páginas do PokéAtlas. Cada função devolve o HTML de uma página.
 * A Pokédex (lista e página de cada espécie) fica em paginas-pokedex.mjs. */
import { JOGOS } from "../dados/jogos.mjs";
import { ESPECIES } from "../dados/especies.mjs";
import { REGIOES, CONSOLES, ESTILOS, TIPOS, PEDIDOS, MARCOS, HORIZONTE, ROMANOS, MAPAS } from "../dados/atlas.mjs";
import { PERGUNTAS } from "../dados/quiz.mjs";
import { EIXOS, TINTAS, valoresDe, encaixe } from "../src/js/relevo.js";
import { perfilRegiao, rosaDosVentos, posicoesDosEixos, reguaDeAnos } from "./cenario.mjs";
import { MAR, TINTA, NOITE, PAPEL, POKEDEX, FICHAS, CARTAS, ORDEM_TIPOS, esc, semAcento, maiuscula, extenso, numero, enderecoEspecie } from "./base.mjs";
import { rotasDaCarta, lugaresDaCarta, tracosDaCarta, caixaCarta } from "./carta.mjs";

/* ---------- utilidades ---------- */

const DIA = `data-fx-fundo="${MAR}" data-fx-tinta="${TINTA}"`;
const nome = (lista, id) => lista.find((x) => x.id === id)?.nome ?? id;

export const ORDENADOS = [...JOGOS].sort((a, b) => a.ano - b.ano || (a.tipo === "derivado") - (b.tipo === "derivado"));
const porSlug = Object.fromEntries(JOGOS.map((j) => [j.slug, j]));
const consolesDe = (j) => j.plataformas.map((p) => nome(CONSOLES, p)).join(" e ");
const lugarDe = (j) => (j.regiao === "outras" ? (j.lugar ? maiuscula(j.lugar) : null) : nome(REGIOES, j.regiao));
const ANO_ATUAL = Math.max(...JOGOS.map((j) => j.ano));

function vizinhos(j, n = 3) {
  const v = valoresDe(j.atributos);
  return JOGOS.filter((o) => o.slug !== j.slug)
    .map((o) => ({ o, s: encaixe(v, valoresDe(o.atributos)) }))
    .sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.o);
}

export function ilha(j, opc = {}) {
  const { noite = false, classe = "", alt = "", preguica = true } = opc;
  return `<img class="ilha ${classe}" src="/ilhas/${j.slug}${noite ? "-noite" : ""}.svg" alt="${esc(alt)}" width="480" height="480"${preguica ? ' loading="lazy" decoding="async"' : ""}>`;
}

function prancha(id) {
  const n = String(id).padStart(3, "0");
  return `<figure class="prancha" tabindex="0">
  <span class="prancha-arte">
    <span class="prancha-tinta" style="--arte:url(/arte/pokemon/${id}-tinta.webp)"></span>
    <img class="prancha-cor" src="/arte/pokemon/${id}.webp" alt="Arte oficial de ${esc(ESPECIES[id])}" width="440" height="440" loading="lazy" decoding="async">
  </span>
  <figcaption><span class="prancha-numero">Nº ${n}</span> ${esc(ESPECIES[id])}</figcaption>
</figure>`;
}

function itemIlha(j, opc = {}) {
  return `<a class="ilha-item" href="/jogos/${j.slug}/">
  ${ilha(j, opc)}
  <span class="ilha-nome">${esc(j.curto)}</span>
  <span class="ilha-meta">${j.ano}, ${esc(consolesDe(j))}</span>
</a>`;
}

/* ---------- moldura comum ---------- */

/* Roda no cabeçalho, antes de a página aparecer:
 * - marca que há JavaScript, para o CSS poder esconder o que vai se desenhar depois;
 * - o navegador às vezes pula a animação entre duas páginas (por exemplo, se a imagem clicada
 *   ainda não terminou de carregar). A página troca do mesmo jeito, só sem animação, mas ele
 *   registra uma promessa rejeitada. Esse aviso, e só ele, é silenciado. */
const ANTES_DE_APARECER = `document.documentElement.classList.add("js");addEventListener("unhandledrejection",(e)=>{if(e.reason&&e.reason.name==="AbortError"&&/Transition was skipped/.test(e.reason.message))e.preventDefault()})`;

const NAV = [
  { href: "/pokedex/", texto: "Pokédex" },
  { href: "/regioes/", texto: "Regiões" },
  { href: "/linha-do-tempo/", texto: "Linha do tempo" },
  { href: "/comparar/", texto: "Comparar" }
];

export function moldura({ titulo, descricao, caminho, classe, corpo, modulo, extra = null, motor = false }) {
  const tituloCompleto = caminho === "/" ? titulo : `${titulo} — PokéAtlas`;
  // dentro de uma seção (a página de uma espécie, de uma região), a aba da seção continua marcada
  const link = (n) => `<a href="${n.href}"${caminho.startsWith(n.href) ? ' aria-current="page"' : ""}>${n.texto}</a>`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="theme-color" content="${MAR}">
<meta property="og:title" content="${esc(tituloCompleto)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<script>${ANTES_DE_APARECER}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fontes/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fontes/alegreya.woff2" as="font" type="font/woff2" crossorigin>
${motor ? '<link rel="stylesheet" href="/motor/sites-incriveis.css">\n' : ""}<link rel="stylesheet" href="/estilo.css">
</head>
<body class="${classe}">
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<header class="topo">
  <a class="marca" href="/"${caminho === "/" ? ' aria-current="page"' : ""}>PokéAtlas</a>
  <button type="button" class="topo-menu" aria-expanded="false" aria-controls="menu">Menu</button>
  <nav class="topo-nav" id="menu" aria-label="Seções">
    ${NAV.map(link).join("\n    ")}
    <a class="botao botao-pequeno" href="/bussola/"${caminho === "/bussola/" ? ' aria-current="page"' : ""}>Abrir a bússola</a>
  </nav>
</header>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape">
  <div class="rodape-grade">
    <div>
      <p class="marca">PokéAtlas</p>
      <p>Um guia para descobrir qual jogo de Pokémon combina com você.</p>
    </div>
    <nav aria-label="Rodapé">
      <a href="/bussola/">Bússola</a>
      ${NAV.map((n) => `<a href="${n.href}">${n.texto}</a>`).join("\n      ")}
    </nav>
    <div class="rodape-avisos">
      <p>Projeto de fã, sem fins lucrativos e sem vínculo com Nintendo, Game Freak, Creatures ou The Pokémon Company. Pokémon e os nomes dos jogos pertencem aos seus donos.</p>
      <p>As notas de cada jogo são leitura editorial do atlas, não dado oficial. A arte dos Pokémon é a oficial, obtida do repositório público PokeAPI/sprites e reimpressa em gravura; as listas de Pokédex vêm da PokéAPI. As cartas das regiões são redesenhos do atlas sobre os mapas dos jogos. Fontes: Archivo e Alegreya.</p>
    </div>
  </div>
</footer>
${motor ? '<script src="/motor/sites-incriveis.js" defer></script>\n' : ""}<script type="module" src="/js/base.js"></script>
${[modulo, extra].filter(Boolean).map((m) => `<script type="module" src="/js/${m}.js"></script>`).join("\n")}
</body>
</html>
`;
}

/* ---------- início ---------- */

const DESTAQUES_ABERTURA = ["heartgold-soulsilver", "scarlet-violet", "black-white", "legends-arceus", "champions", "red-blue-yellow"];
export const DEMO_COMPARAR = ["red-blue-yellow", "scarlet-violet"];
/* Espécies do mosaico da página inicial, com o tamanho e a força do paralaxe de cada uma. */
const FAVORITOS = [[6, 0.1], [448, 0.22], [25, 0.06], [94, 0.26], [143, 0.12], [700, 0.18], [248, 0.08], [133, 0.2], [384, 0.14]];

function folhaRegiao(r) {
  const jogos = ORDENADOS.filter((j) => j.regiao === r.id);
  return `<article class="folha${CARTAS[r.id].proporcao < 0.7 ? " folha-alta" : ""}">
  <div class="folha-texto-coluna">
    <header class="folha-topo">
      <p class="folha-geracao">Geração ${ROMANOS[r.geracao]}</p>
      <h3 class="folha-nome"><a href="/regioes/${r.id}/">${r.nome}</a></h3>
      <p class="folha-inspiracao">${esc(r.inspiracao)}</p>
    </header>
    <p class="folha-texto">${esc(r.texto)}</p>
    <div class="folha-iniciais">${r.iniciais.map(prancha).join("")}</div>
    <ul class="folha-jogos">
      ${jogos.map((j) => `<li><a href="/jogos/${j.slug}/">${ilha(j)}<span><span class="ilha-nome">${esc(j.curto)}</span><span class="ilha-meta">${j.ano}</span></span></a></li>`).join("\n      ")}
    </ul>
  </div>
  ${caixaCarta(r.id, { ligacao: `/regioes/${r.id}/`, rotulo: `Abrir a carta de ${r.nome}` })}
</article>`;
}

/* Posições do arquipélago noturno: uma grade frouxa, com cada ilha um pouco fora do lugar. */
function arquipelago() {
  const colunas = 6, linhas = Math.ceil(ORDENADOS.length / colunas);
  return ORDENADOS.map((j, i) => {
    const c = i % colunas, l = Math.floor(i / colunas);
    const dx = ((i * 37) % 11 - 5) * 0.9, dy = ((i * 53) % 9 - 4) * 1.1;
    const x = ((c + 0.5) / colunas) * 100 + dx * 0.5, y = ((l + 0.5) / linhas) * 100 + dy * 0.5;
    const lado = x < 18 ? " nome-esquerda" : x > 82 ? " nome-direita" : "";
    return `<span class="pico-ilha${lado}" data-slug="${j.slug}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%">${ilha(j, { noite: true })}${ilha(j, { classe: "pico-ilha-acesa" })}<span class="pico-ilha-nome">${esc(j.curto)}</span></span>`;
  }).join("");
}

export function paginaInicio() {
  const primeiro = porSlug[DESTAQUES_ABERTURA[0]];
  const [da, db] = DEMO_COMPARAR.map((s) => porSlug[s]);
  const pedidos = EIXOS.map((e) => {
    const p = PEDIDOS[e.id], j = porSlug[p.eleito];
    return `<li data-eixo="${e.id}">
        <p class="pico-frase">“${esc(p.frase)}”</p>
        <p class="pico-resposta">O cume mais alto em ${e.nome.toLowerCase()} é <a href="/jogos/${j.slug}/">${esc(j.curto)}</a>.</p>
      </li>`;
  }).join("\n      ");

  const corpo = `
<section class="abertura" ${DIA} aria-labelledby="t-abertura">
  <canvas class="abertura-mar" aria-hidden="true"></canvas>
  <div class="abertura-eixos" aria-hidden="true">${EIXOS.map((e) => `<span data-eixo="${e.id}">${e.nome}</span>`).join("")}</div>
  <div class="abertura-texto">
    <h1 class="marca-gigante" id="t-abertura">PokéAtlas</h1>
    <p class="abertura-lema" data-fx="palavras" data-fx-duracao="1200">Todo jogo de Pokémon é uma ilha. Uma delas tem o seu formato.</p>
  </div>
  <div class="abertura-legenda">
    <p>No mapa agora, <a href="/jogos/${primeiro.slug}/" data-ilha-atual>${esc(primeiro.curto)}</a>.</p>
    <p>Seis direções, seis qualidades. Morro alto e costa distante querem dizer nota alta.</p>
  </div>
</section>

<section class="travessia" data-fx-fixa data-fx-altura="6.5" ${DIA} aria-labelledby="t-travessia">
  <div class="fx-palco">
    <div class="trilho" data-fx="trilho">
      <header class="folha-intro">
        <h2 id="t-travessia">${maiuscula(extenso(REGIOES.length))} cartas, de Kanto a Paldea</h2>
        <p class="prosa">Cada região tem a sua carta, três primeiros companheiros e os jogos que se passam nela. Toque numa carta para abri-la com os nomes e as rotas.</p>
      </header>
      ${REGIOES.map(folhaRegiao).join("\n      ")}
    </div>
  </div>
</section>

<section class="tempo" ${DIA} aria-labelledby="t-tempo">
  <div class="tempo-grade">
    <div class="tempo-texto">
      <h2 id="t-tempo">${maiuscula(extenso(ANO_ATUAL - ORDENADOS[0].ano))} anos de estrada</h2>
      <p class="prosa">De um cartucho cinza de 1996 a mundos abertos para quatro pessoas. Cada ponto da régua é um jogo deste atlas, e nenhum se joga do mesmo jeito.</p>
      <a class="botao botao-contorno" href="/linha-do-tempo/">Ver a linha do tempo</a>
    </div>
    <dl class="numeros">
      <div><dd data-fx="contar" data-fx-fim="${ANO_ATUAL - ORDENADOS[0].ano}">${ANO_ATUAL - ORDENADOS[0].ano}</dd><dt>anos desde Red e Green</dt></div>
      <div><dd data-fx="contar" data-fx-fim="${Math.max(...REGIOES.map((r) => r.geracao))}">${Math.max(...REGIOES.map((r) => r.geracao))}</dd><dt>gerações lançadas</dt></div>
      <div><dd data-fx="contar" data-fx-fim="${REGIOES.length}">${REGIOES.length}</dd><dt>regiões mapeadas</dt></div>
      <div><dd data-fx="contar" data-fx-fim="${JOGOS.length}">${JOGOS.length}</dd><dt>ilhas neste atlas</dt></div>
    </dl>
  </div>
  <div class="tempo-regua" data-fx="surgir">
    ${reguaDeAnos(ORDENADOS, HORIZONTE.ano)}
    <p class="regua-chave"><span class="chave chave-cheia"></span>Série principal, remakes e Legends <span class="chave chave-vazada"></span>Derivados</p>
  </div>
</section>

<section class="pico" data-fx-fixa data-fx-altura="7.5" data-fx-fundo="${NOITE}" data-fx-tinta="${PAPEL}" aria-labelledby="t-pico">
  <div class="fx-palco">
    <div class="pico-mapa" aria-hidden="true">
      <div class="pico-arquipelago">${arquipelago()}</div>
      <div class="pico-bussola">
        ${rosaDosVentos()}
        ${posicoesDosEixos(56).map((e) => `<span class="pico-direcao" data-eixo="${e.id}" style="left:${e.x.toFixed(1)}%;top:${e.y.toFixed(1)}%">${e.nome}</span>`).join("")}
      </div>
    </div>
    <div class="pico-texto">
      <h2 id="t-pico">${maiuscula(extenso(JOGOS.length))} ilhas, uma agulha</h2>
      <div class="pico-roteiro">
        <p class="pico-abre">A agulha aponta para o que se procura, e só as ilhas altas naquela direção continuam acesas.</p>
        <ol class="pico-pedidos">
      ${pedidos}
        </ol>
        <div class="pico-final">
          <p>E você, o que procura?</p>
          <a class="botao" href="/bussola/">Abrir a bússola</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="ferramentas" ${DIA}>
  <div class="ferramenta ferramenta-pokedex">
    <ul class="mosaico mosaico-especies" aria-label="Algumas espécies da Pokédex">
      ${FAVORITOS.map(([e, forca]) => `<li class="mosaico-ilha" data-fx-paralaxe="${forca}"><a href="${enderecoEspecie(e)}" aria-label="${esc(FICHAS[e].nome)}"><img src="/arte/mini/${e}.webp" alt="" width="184" height="184" loading="lazy" decoding="async"></a></li>`).join("\n      ")}
    </ul>
    <div class="ferramenta-texto">
      <h2>A Pokédex inteira, em gravura</h2>
      <p class="prosa">São ${numero(Object.keys(FICHAS).length)} espécies. Cada uma tem a sua página, com atributos, linha evolutiva, curiosidades e os jogos em que aparece.</p>
      <form class="busca-inicio" action="/pokedex/" method="get" role="search">
        <label for="pokemon-inicio">Procurar um Pokémon</label>
        <div class="busca-inicio-linha">
          <input id="pokemon-inicio" name="q" type="search" placeholder="Lucario" autocomplete="off" spellcheck="false">
          <button class="botao" type="submit">Abrir a Pokédex</button>
        </div>
      </form>
    </div>
  </div>
  <div class="ferramenta ferramenta-comparar">
    <div class="ferramenta-texto">
      <h2>Na dúvida entre dois, sobreponha</h2>
      <p class="prosa">Duas ilhas, duas tintas. Onde as costas coincidem, os jogos se parecem. Onde uma avança sozinha, está a diferença.</p>
      <a class="botao botao-contorno" href="/comparar/?a=${da.slug}&amp;b=${db.slug}">Comparar dois jogos</a>
    </div>
    <figure class="sobreposicao">
      <div class="sobreposicao-ilhas" aria-hidden="true">
        <img src="/ilhas/demo-a.svg" alt="" width="480" height="480" loading="lazy" data-fx-mouse="14">
        <img src="/ilhas/demo-b.svg" alt="" width="480" height="480" loading="lazy" data-fx-mouse="-14">
      </div>
      <figcaption><span class="serie serie-a"></span>${esc(da.curto)} <span class="serie serie-b"></span>${esc(db.curto)}</figcaption>
    </figure>
  </div>
</section>

<section class="fechamento" ${DIA} aria-labelledby="t-fechamento">
  <h2 id="t-fechamento" data-fx="palavras" data-fx-duracao="1400">Em algum ponto deste mar existe uma ilha com o seu formato.</h2>
  <p class="prosa">${maiuscula(extenso(PERGUNTAS.length))} perguntas. O mapa se desenha enquanto você responde.</p>
  <a class="botao botao-grande" href="/bussola/">Abrir a bússola</a>
</section>`;

  return moldura({
    titulo: "PokéAtlas — descubra qual jogo de Pokémon combina com você",
    descricao: "Um atlas visual dos jogos de Pokémon. Explore as regiões e a Pokédex, compare títulos e use a bússola para encontrar o jogo que tem o seu formato.",
    caminho: "/", classe: "pagina-inicio", corpo, modulo: "inicio", motor: true
  });
}

/* ---------- página de jogo ---------- */

function barra(nota) {
  return `<span class="estratos" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<span class="estrato${n <= nota ? ` estrato-${n}` : ""}"></span>`).join("")}</span>`;
}

export function paginaJogo(j) {
  const i = ORDENADOS.indexOf(j);
  const anterior = ORDENADOS[i - 1], proximo = ORDENADOS[i + 1];
  const lugar = lugarDe(j);
  const eixos = EIXOS.map((e) => ({ ...e, nota: j.atributos[e.id] })).sort((a, b) => b.nota - a.nota);
  const perto = vizinhos(j);
  const resumo = eixos.map((e) => `${e.nome} ${e.nota}`).join(", ");
  const ficha = [
    ["Lançamento", String(j.ano)],
    ["Console", esc(consolesDe(j))],
    lugar ? [j.regiao === "outras" ? "Cenário" : "Região", j.regiao === "outras" ? esc(lugar) : `<a href="/regioes/${j.regiao}/">${esc(lugar)}</a>`] : null,
    j.geracao ? ["Geração", ROMANOS[j.geracao]] : null,
    ["Estilo", esc(nome(ESTILOS, j.estilo))],
    ["Categoria", esc(nome(TIPOS, j.tipo))]
  ].filter(Boolean);

  const corpo = `
<article class="jogo" data-slug="${j.slug}">
  <section class="jogo-topo">
    <div class="jogo-texto">
      <p class="migalha"><a href="/linha-do-tempo/">Todos os jogos</a></p>
      <h1>${esc(j.titulo)}</h1>
      <p class="jogo-chamada">${esc(j.chamada)}</p>
      <dl class="ficha-tecnica">
        ${ficha.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("\n        ")}
      </dl>
    </div>
    <figure class="jogo-mapa">
      <div class="mapa-vivo mapa-do-jogo">
        ${ilha(j, { preguica: false, alt: `Ilha de ${j.curto}. Notas: ${resumo}.` })}
        <canvas aria-hidden="true"></canvas>
        ${posicoesDosEixos(50).map((e) => `<span class="mapa-direcao" data-eixo="${e.id}" style="left:${e.x.toFixed(1)}%;top:${e.y.toFixed(1)}%">${e.nome}</span>`).join("")}
      </div>
    </figure>
  </section>

  <section class="jogo-relevo" aria-labelledby="t-relevo">
    <h2 id="t-relevo">Leitura do relevo</h2>
    <p class="nota-editorial">Notas de 1 a 5, na avaliação do atlas.</p>
    <ul class="relevo-lista">
      ${eixos.map((e) => `<li data-eixo="${e.id}">
        <span class="relevo-eixo">${e.nome}</span>
        ${barra(e.nota)}
        <span class="relevo-nota"><span class="so-leitor">nota </span>${e.nota}<span class="so-leitor"> de 5</span></span>
        <span class="relevo-texto">${esc(j.notas[e.id] ?? `${maiuscula(e.nota >= 4 ? PEDIDOS[e.id].alto : e.nota <= 2 ? PEDIDOS[e.id].baixo : "fica na média do arquipélago")}.`)}</span>
      </li>`).join("\n      ")}
    </ul>
  </section>

  <section class="jogo-corpo">
    <div class="prosa">
      ${j.texto.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </div>
    <div class="jogo-listas">
      <div>
        <h2>É para você, se</h2>
        <ul class="lista-marcada">${j.paraQuem.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <div>
        <h2>Talvez não seja, se</h2>
        <ul class="lista-marcada lista-contra">${j.naoSe.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
    </div>
  </section>

  ${j.regiao === "outras" ? "" : `<section class="jogo-regiao" aria-labelledby="t-regiao">
    ${caixaCarta(j.regiao, { ligacao: `/regioes/${j.regiao}/`, rotulo: `Abrir a carta de ${lugar}` })}
    <div>
      <h2 id="t-regiao">Onde se passa</h2>
      <p class="jogo-regiao-nome">${esc(lugar)}</p>
      <p class="prosa">${esc(REGIOES.find((x) => x.id === j.regiao).texto)}</p>
      <a class="botao botao-contorno" href="/regioes/${j.regiao}/">Abrir a carta de ${esc(lugar)}</a>
    </div>
  </section>`}

  <section class="jogo-especimes" aria-labelledby="t-especimes">
    <h2 id="t-especimes">Espécimes deste jogo</h2>
    <div class="pranchas">${j.mascotes.map(prancha).join("")}</div>
  </section>

  ${secaoPokedex(j)}

  <section class="jogo-vizinhas" aria-labelledby="t-vizinhas">
    <h2 id="t-vizinhas">Ilhas de formato parecido</h2>
    <ul class="arquipelago arquipelago-curto">
      ${perto.map((o) => `<li>${itemIlha(o)}<a class="ligacao" href="/comparar/?a=${j.slug}&amp;b=${o.slug}">Comparar as duas</a></li>`).join("\n      ")}
    </ul>
  </section>

  <nav class="jogo-passos" aria-label="Ordem de lançamento">
    ${anterior ? `<a href="/jogos/${anterior.slug}/"><span>Lançado antes</span>${esc(anterior.curto)}, ${anterior.ano}</a>` : "<span></span>"}
    ${proximo ? `<a href="/jogos/${proximo.slug}/"><span>Lançado depois</span>${esc(proximo.curto)}, ${proximo.ano}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    titulo: j.titulo, caminho: `/jogos/${j.slug}/`, classe: "pagina-jogo", corpo, modulo: "jogo", extra: j.pokedex ? "pokedex" : null,
    descricao: `${j.chamada} Veja para quem é ${j.curto}, o relevo do jogo e títulos parecidos.`
  });
}

/* ---------- linha do tempo ---------- */

export function paginaLinha() {
  const anos = [...new Set([...ORDENADOS.map((j) => j.ano), ...MARCOS.map((m) => m.ano)])].sort((a, b) => a - b);
  const primeiroPorConsole = {};
  for (const j of ORDENADOS) for (const p of j.plataformas) primeiroPorConsole[p] ??= j.ano;
  let consoleAtual = "";
  const entradas = anos.map((ano, i) => {
    const jogos = ORDENADOS.filter((j) => j.ano === ano);
    const marco = MARCOS.find((m) => m.ano === ano);
    const estreias = Object.entries(primeiroPorConsole).filter(([, a]) => a === ano).map(([p]) => nome(CONSOLES, p));
    if (estreias.length) consoleAtual = estreias[estreias.length - 1];
    const salto = i ? ano - anos[i - 1] : 0;
    return `<li class="linha-ano" id="ano-${ano}" data-ano="${ano}" data-console="${esc(consoleAtual)}" style="--salto:${salto}">
      <h2 class="linha-rotulo">${ano}</h2>
      ${marco ? `<p class="linha-marco">${esc(marco.texto)}</p>` : ""}
      ${estreias.length ? `<p class="linha-estreia">Primeiro jogo do atlas ${estreias.length > 1 ? "nestas plataformas" : "nesta plataforma"}: ${estreias.map(esc).join(" e ")}.</p>` : ""}
      ${jogos.length ? `<ul class="linha-jogos">${jogos.map((j) => `<li data-tipo="${j.tipo}"><a href="/jogos/${j.slug}/">${ilha(j)}<span class="linha-jogo-texto"><span class="ilha-nome">${esc(j.curto)}</span><span class="ilha-meta">${esc(nome(TIPOS, j.tipo))}, ${esc(consolesDe(j))}</span><span class="linha-chamada">${esc(j.chamada)}</span></span></a></li>`).join("")}</ul>` : ""}
    </li>`;
  }).join("\n    ");

  const corpo = `
<section class="cabecalho">
  <h1>Linha do tempo</h1>
  <p class="prosa">De ${anos[0]} até hoje, na ordem em que cada jogo chegou. A distância entre dois anos na página acompanha o tempo que passou entre eles.</p>
  <div class="filtro filtro-linha" role="group" aria-label="Mostrar">
    <div class="filtro-opcoes">
      <button type="button" class="ficha" data-tipo="" aria-pressed="true">Tudo</button>
      <button type="button" class="ficha" data-tipo="principal" aria-pressed="false">Série principal</button>
      <button type="button" class="ficha" data-tipo="remake legends" aria-pressed="false">Remakes e Legends</button>
      <button type="button" class="ficha" data-tipo="derivado" aria-pressed="false">Derivados</button>
    </div>
  </div>
</section>
<section class="linha">
  <aside class="linha-marcador" aria-hidden="true">
    <span class="linha-marcador-ano" data-ano-atual>${anos[0]}</span>
    <span class="linha-marcador-console" data-console-atual>${esc(nome(CONSOLES, ORDENADOS[0].plataformas[0]))}</span>
  </aside>
  <ol class="linha-anos">
    ${entradas}
    <li class="linha-ano linha-horizonte" id="ano-${HORIZONTE.ano}" data-ano="${HORIZONTE.ano}" data-console="Nintendo Switch 2" style="--salto:${HORIZONTE.ano - anos[anos.length - 1]}">
      <h2 class="linha-rotulo">${HORIZONTE.ano}</h2>
      <p class="linha-marco">No horizonte: ${esc(HORIZONTE.titulo)}. ${esc(HORIZONTE.texto)}</p>
    </li>
  </ol>
  <nav class="linha-indice" aria-label="Ir para o ano">
    ${[...anos, HORIZONTE.ano].map((a) => `<a href="#ano-${a}" data-ano="${a}">${a}</a>`).join("")}
  </nav>
</section>`;

  return moldura({
    titulo: "Linha do tempo", caminho: "/linha-do-tempo/", classe: "pagina-linha", corpo, modulo: "linha",
    descricao: `A franquia Pokémon de ${anos[0]} a ${HORIZONTE.ano}, jogo a jogo e console a console.`
  });
}

/* ---------- comparar ---------- */

export function paginaComparar() {
  const opcoes = (vazio) => `${vazio ? '<option value="">Nenhum</option>' : ""}${ORDENADOS.map((j) => `<option value="${j.slug}">${esc(j.curto)} (${j.ano})</option>`).join("")}`;
  const corpo = `
<section class="cabecalho">
  <h1>Comparar</h1>
  <p class="prosa">Escolha dois jogos, ou três, e veja as ilhas uma sobre a outra. Onde as costas coincidem, eles se parecem.</p>
</section>
<section class="comparar">
  <noscript><p class="prosa">A comparação precisa de JavaScript para sobrepor as ilhas. Sem ele, cada página de jogo, a partir da <a href="/linha-do-tempo/">linha do tempo</a>, traz as mesmas notas.</p></noscript>
  <form class="comparar-escolha" aria-label="Jogos a comparar">
    <label class="escolha escolha-a"><span><span class="serie serie-a"></span>Primeira ilha</span><select name="a">${opcoes(false)}</select></label>
    <label class="escolha escolha-b"><span><span class="serie serie-b"></span>Segunda ilha</span><select name="b">${opcoes(false)}</select></label>
    <label class="escolha escolha-c"><span><span class="serie serie-c"></span>Terceira, se quiser</span><select name="c">${opcoes(true)}</select></label>
  </form>
  <div class="comparar-grade">
    <figure class="comparar-mapa">
      <div class="mapa-vivo">
        <canvas role="img" aria-label="Ilhas dos jogos escolhidos, sobrepostas"></canvas>
        ${posicoesDosEixos(50).map((e) => `<span class="mapa-direcao" data-eixo="${e.id}" style="left:${e.x.toFixed(1)}%;top:${e.y.toFixed(1)}%">${e.nome}</span>`).join("")}
      </div>
      <figcaption class="comparar-chave" data-chave></figcaption>
    </figure>
    <div class="comparar-dados">
      <h2>Nota por nota</h2>
      <div class="hastes" data-hastes></div>
      <p class="nota-editorial">Notas de 1 a 5, na avaliação do atlas.</p>
    </div>
  </div>
  <div class="comparar-veredito" data-veredito aria-live="polite"></div>
  <div class="comparar-tabela">
    <h2>Lado a lado</h2>
    <div class="tabela-rolagem"><table data-tabela></table></div>
  </div>
</section>`;

  return moldura({
    titulo: "Comparar", caminho: "/comparar/", classe: "pagina-comparar", corpo, modulo: "comparar",
    descricao: "Compare dois ou três jogos de Pokémon: relevos sobrepostos, nota por nota e ficha lado a lado."
  });
}

/* ---------- bússola ---------- */

export function paginaBussola() {
  const corpo = `
<section class="bussola" data-estado="perguntas">
  <div class="bussola-coluna">
    <header class="bussola-topo">
      <h1>Bússola</h1>
      <p class="bussola-passo" data-passo aria-live="polite">Pergunta 1 de ${PERGUNTAS.length}</p>
    </header>
    <div class="bussola-pergunta" data-pergunta>
      <noscript><p class="prosa">A bússola precisa de JavaScript para desenhar o seu mapa. Enquanto isso, a <a href="/linha-do-tempo/">linha do tempo</a> mostra todas as ilhas.</p></noscript>
    </div>
    <div class="bussola-acoes">
      <button type="button" class="ligacao" data-voltar hidden>Voltar uma pergunta</button>
    </div>
  </div>
  <figure class="bussola-mapa">
    <div class="mapa-vivo">
      <canvas role="img" aria-label="A sua ilha, que cresce a cada resposta"></canvas>
      ${posicoesDosEixos(50).map((e) => `<span class="mapa-direcao" data-eixo="${e.id}" style="left:${e.x.toFixed(1)}%;top:${e.y.toFixed(1)}%">${e.nome}</span>`).join("")}
    </div>
    <figcaption data-legenda>A sua ilha ainda está submersa. Cada resposta levanta um pedaço dela.</figcaption>
  </figure>
</section>
<section class="resultado" data-resultado hidden aria-labelledby="t-resultado">
  <h2 id="t-resultado" tabindex="-1">As ilhas com o seu formato</h2>
  <p class="prosa" data-resumo></p>
  <ol class="resultado-lista" data-lista></ol>
  <div class="resultado-acoes">
    <button type="button" class="botao botao-contorno" data-refazer>Refazer a bússola</button>
    <button type="button" class="ligacao" data-copiar>Copiar o link deste resultado</button>
    <span class="so-leitor" aria-live="polite" data-copiado></span>
  </div>
</section>`;

  return moldura({
    titulo: "Bússola", caminho: "/bussola/", classe: "pagina-bussola", corpo, modulo: "bussola",
    descricao: `${maiuscula(extenso(PERGUNTAS.length))} perguntas para descobrir qual jogo de Pokémon combina com você, com a explicação de cada recomendação.`
  });
}

/* ---------- 404 ---------- */

export function pagina404() {
  const corpo = `
<section class="cabecalho cabecalho-perdido">
  <h1>Esta ilha não está no mapa</h1>
  <p class="prosa">O endereço não leva a lugar nenhum do atlas. A linha do tempo mostra todas as ilhas que existem.</p>
  <p><a class="botao" href="/linha-do-tempo/">Ver todos os jogos</a></p>
</section>`;
  return moldura({ titulo: "Página não encontrada", caminho: "/404", classe: "pagina-404", corpo, descricao: "Página não encontrada no PokéAtlas." });
}

/* ---------- Pokédex de um jogo ---------- */

/* Em que região cada lista se passa, para mostrar a forma regional nativa. */
const REGIAO_DA_LISTA = {
  "original-alola": "alola", "updated-alola": "alola",
  galar: "galar", "isle-of-armor": "galar", "crown-tundra": "galar",
  hisui: "hisui", paldea: "paldea"
};
const NOME_DA_REGIAO = { alola: "Alola", galar: "Galar", hisui: "Hisui", paldea: "Paldea" };

function secaoPokedex(j) {
  if (!j.pokedex) {
    return `<section class="jogo-pokedex" aria-labelledby="t-pokedex">
    <h2 id="t-pokedex">Pokédex</h2>
    <p class="prosa">${esc(j.semPokedex)}</p>
  </section>`;
  }
  const listas = j.pokedex.map(([id, rotulo]) => ({ id, rotulo, entradas: POKEDEX.dex[id] }));
  const presentes = new Set(listas.flatMap((l) => l.entradas.flatMap(([, e]) => POKEDEX.especies[e][1])));
  const tipos = ORDEM_TIPOS.filter((t) => presentes.has(t));
  const unica = listas.length === 1;
  const titulo = !unica ? "Pokédex" : listas[0].rotulo === "Elenco" ? "Elenco de Pokémon" : `Pokédex de ${listas[0].rotulo}`;
  const gaveta = (l, i) => `<ol class="gaveta" data-lista="${l.id}"${i ? " hidden" : ""}>
      ${l.entradas.map(([n, e]) => {
        const nome = POKEDEX.especies[e][0];
        const regiao = REGIAO_DA_LISTA[l.id];
        const forma = regiao && POKEDEX.formas[regiao][e];
        const [arte, ts] = forma || [e, POKEDEX.especies[e][1]];
        return `<li data-nome="${esc(semAcento(nome))}" data-tipos="${ts.map(semAcento).join(" ")}"><a href="${enderecoEspecie(e)}"><span class="dex-arte"><img src="/arte/mini/${arte}.webp" data-cor="/arte/mini/${arte}-cor.webp" alt="" width="92" height="92" loading="lazy" decoding="async"></span><span class="dex-numero">${String(n).padStart(3, "0")}</span><span class="dex-nome">${esc(nome)}</span>${forma ? `<span class="dex-forma">forma de ${NOME_DA_REGIAO[regiao]}</span>` : ""}<span class="dex-tipos">${ts.join(", ")}</span></a></li>`;
      }).join("")}
    </ol>`;
  return `<section class="jogo-pokedex" aria-labelledby="t-pokedex" data-pokedex>
    <h2 id="t-pokedex">${titulo}</h2>
    <p class="nota-editorial">${j.pokedexNota ? `${esc(j.pokedexNota)} ` : ""}${listas.some((l) => REGIAO_DA_LISTA[l.id]) ? "Quando a espécie tem uma forma regional nativa deste jogo, é ela que aparece, com os tipos dela. " : "A arte e os tipos são os da forma padrão de cada espécie. "}Escolha uma espécie para abrir a página dela.</p>
    <div class="dex-controles">
      ${unica ? "" : `<div class="filtro-opcoes" role="group" aria-label="Lista">${listas.map((l, i) => `<button type="button" class="ficha" data-aba="${l.id}" aria-pressed="${i === 0}">${esc(l.rotulo)} <span class="dex-conta">${l.entradas.length}</span></button>`).join("")}</div>`}
      <div class="dex-busca">
        <label for="dex-procurar">Procurar nesta lista</label>
        <input id="dex-procurar" type="search" placeholder="Nome ou número" autocomplete="off" spellcheck="false">
      </div>
      <div class="filtro-opcoes" role="group" aria-label="Tipo">${tipos.map((t) => `<button type="button" class="ficha ficha-tipo" data-tipo="${semAcento(t)}" aria-pressed="false">${t}</button>`).join("")}</div>
      <p class="dex-resumo" aria-live="polite"><strong data-dex-contagem>${listas[0].entradas.length}</strong> <span data-dex-rotulo>espécies</span></p>
    </div>
    ${listas.map(gaveta).join("\n    ")}
    <p class="dex-mais" hidden><button type="button" class="botao botao-contorno" data-dex-mais>Mostrar todas</button></p>
    <p class="vazio" data-dex-vazio hidden>Nenhuma espécie com esse nome ou tipo nesta lista.</p>
  </section>`;
}

/* ---------- regiões ---------- */

export function paginaRegiao(r) {
  const i = REGIOES.indexOf(r);
  const anterior = REGIOES[i - 1], proxima = REGIOES[i + 1];
  const mapa = MAPAS[r.id], carta = CARTAS[r.id];
  const pontos = lugaresDaCarta(r.id);
  const rotas = rotasDaCarta(r.id);
  const jogos = ORDENADOS.filter((j) => j.regiao === r.id);
  const alta = carta.proporcao < 0.7;
  const descricao = `Carta de ${r.nome}, com ${mapa.cidades.length} ${mapa.cidades.length === 1 ? "povoado marcado" : "cidades marcadas"}${mapa.marcos.length ? ` e ${mapa.marcos.length} ${mapa.marcos.length === 1 ? "marco" : "marcos"}` : ""}. A lista completa vem logo abaixo.`;

  const corpo = `
<article class="regiao${alta ? " regiao-alta" : ""}">
  <header class="cabecalho">
    <p class="migalha"><a href="/regioes/">Regiões</a></p>
    <h1>${r.nome}</h1>
    <p class="regiao-meta">Geração ${ROMANOS[r.geracao]}. ${esc(r.inspiracao)}.</p>
    <p class="prosa">${esc(r.texto)}</p>
  </header>

  <section class="regiao-carta" aria-labelledby="t-carta">
    <h2 id="t-carta" class="so-leitor">Carta de ${r.nome}</h2>
    <figure class="carta">
      <div class="carta-caixa carta-grande" data-carta="${r.id}" style="--proporcao:${carta.proporcao}">
        <img class="carta-terreno" src="/cartas/${r.id}.svg" alt="${esc(descricao)}" width="1000" height="${carta.altura}">
        ${tracosDaCarta(r.id, { pontos: false, destacavel: true })}
        <ol class="carta-pontos" aria-hidden="true">
          ${pontos.map((p) => `<li class="ponto ponto-${p.tipo} lado-${p.lado}" data-lugar="${p.n}" style="left:${p.x}%;top:${p.y}%"><span class="ponto-marca">${p.n}</span><span class="ponto-nome">${esc(p.nome)}</span></li>`).join("\n          ")}
          ${(mapa.areas || []).map(([nome, x, y]) => `<li class="ponto-area" style="left:${x}%;top:${y}%">${esc(nome)}</li>`).join("\n          ")}
          ${rotas.map((t, k) => (t.n ? `<li class="rota-numero" data-rota="${k}" style="left:${t.x.toFixed(1)}%;top:${t.y.toFixed(1)}%">${t.n}</li>` : "")).join("")}
        </ol>
      </div>
      <figcaption>Carta redesenhada pelo atlas a partir do mapa da região nos jogos: a costa segue o original, o relevo é interpretação.${rotas.length ? " As linhas vermelhas são as rotas, cada uma com o seu número." : ""} Aponte ou toque num lugar${rotas.length ? " ou numa rota" : ""} para destacá-lo.${mapa.nota ? ` ${esc(mapa.nota)}` : ""}</figcaption>
    </figure>
    <div class="carta-legenda">
      <h2>Lugares na carta</h2>
      <ol class="legenda-lista">
        ${pontos.map((p) => `<li class="legenda-${p.tipo}" data-lugar="${p.n}"><span class="ponto-marca" aria-hidden="true">${p.n}</span>${esc(p.nome)}</li>`).join("\n        ")}
      </ol>
      ${(mapa.areas || []).length ? `<p class="nota-editorial">Também na carta, sem número: ${mapa.areas.map(([n]) => esc(n)).join(", ")}.</p>` : ""}
      <h2 class="legenda-rotas">Rotas</h2>
      ${rotas.length ? `<ul class="rotas-lista">
        ${rotas.map((t, k) => `<li data-rota="${k}"><span class="rota-n${t.n ? "" : " rota-sem"}">${t.n || "sem nº"}</span><span>${t.nome ? `${esc(t.nome)}. ` : ""}${esc(t.texto)}</span></li>`).join("\n        ")}
      </ul>
      <p class="nota-editorial">Rotas vizinhas que formam um só caminho aparecem juntas, como “3–4”. Trechos sem número são pontes, túneis e travessias que os jogos não numeram.</p>` : `<p class="prosa">${esc(mapa.semRotas)}</p>`}
    </div>
  </section>

  <section class="regiao-iniciais" aria-labelledby="t-iniciais">
    <h2 id="t-iniciais">Primeiros companheiros</h2>
    <div class="pranchas">${r.iniciais.map(prancha).join("")}</div>
  </section>

  <section class="regiao-jogos" aria-labelledby="t-jogos">
    <h2 id="t-jogos">${jogos.length === 1 ? "O jogo que se passa aqui" : "Jogos que se passam aqui"}</h2>
    <ul class="arquipelago arquipelago-curto">
      ${jogos.map((j) => `<li>${itemIlha(j)}${j.pokedex ? `<a class="ligacao" href="/jogos/${j.slug}/#t-pokedex">Ver a Pokédex</a>` : ""}</li>`).join("\n      ")}
    </ul>
  </section>

  <div class="regiao-perfil" aria-hidden="true">${perfilRegiao(r.cenario)}</div>

  <nav class="jogo-passos" aria-label="Outras regiões">
    ${anterior ? `<a href="/regioes/${anterior.id}/"><span>Carta anterior</span>${anterior.nome}</a>` : "<span></span>"}
    ${proxima ? `<a href="/regioes/${proxima.id}/"><span>Próxima carta</span>${proxima.nome}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    titulo: `${r.nome}, a carta da região`, caminho: `/regioes/${r.id}/`, classe: "pagina-regiao", corpo, modulo: "regiao",
    descricao: `${r.texto} Veja a carta de ${r.nome}, as cidades, os iniciais e os jogos que se passam nela.`
  });
}

/* A chave das cartas: as cinco faixas de altitude e os três símbolos. */
function chaveDasCartas() {
  const faixas = TINTAS.dia.terra.map((cor) => `<span style="background:${cor}"></span>`).join("");
  return `<li class="regioes-chave">
      <h2>Como ler as cartas</h2>
      <dl>
        <div><dt><span class="chave-faixas" aria-hidden="true">${faixas}</span></dt><dd>Altitude, da costa ao cume</dd></div>
        <div><dt><svg viewBox="0 0 44 14" aria-hidden="true"><path d="M2 7H42" class="chave-rota"/></svg></dt><dd>Rota</dd></div>
        <div><dt><svg viewBox="0 0 44 14" aria-hidden="true"><circle cx="22" cy="7" r="4.5" class="chave-cidade"/></svg></dt><dd>Cidade ou vila</dd></div>
        <div><dt><svg viewBox="0 0 44 14" aria-hidden="true"><rect x="18" y="3" width="8" height="8" transform="rotate(45 22 7)" class="chave-marco"/></svg></dt><dd>Caverna, lago, torre ou outro marco</dd></div>
      </dl>
      <p>A costa de cada carta segue o mapa dos jogos. O relevo é interpretação do atlas.</p>
    </li>`;
}

export function paginaRegioes() {
  const corpo = `
<section class="cabecalho">
  <h1>Regiões</h1>
  <p class="prosa">${maiuscula(extenso(REGIOES.length))} cartas, redesenhadas a partir dos mapas dos jogos. Abra uma para ver os nomes das cidades, as rotas numeradas e os jogos que se passam ali.</p>
</section>
<section class="regioes">
  <ul class="regioes-lista">
    ${REGIOES.map((r) => `<li${CARTAS[r.id].proporcao < 0.7 ? ' class="regioes-alta"' : ""}>
      ${caixaCarta(r.id, { ligacao: `/regioes/${r.id}/`, rotulo: `Carta de ${r.nome}` })}
      <a class="regioes-nome" href="/regioes/${r.id}/">${r.nome}</a>
      <span class="ilha-meta">Geração ${ROMANOS[r.geracao]}. ${esc(r.inspiracao)}</span>
    </li>`).join("\n    ")}
    ${chaveDasCartas()}
  </ul>
</section>`;
  return moldura({
    titulo: "Regiões", caminho: "/regioes/", classe: "pagina-regioes", corpo,
    descricao: `As ${REGIOES.length} regiões de Pokémon em cartas redesenhadas, de Kanto a Paldea, com cidades, rotas e os jogos de cada uma.`
  });
}

/* ---------- dados enviados ao navegador ---------- */

export function dadosDoNavegador() {
  const jogos = ORDENADOS.map((j) => ({
    slug: j.slug, titulo: j.titulo, curto: j.curto, ano: j.ano, tipo: j.tipo,
    plataformas: j.plataformas, consoles: consolesDe(j), estilo: nome(ESTILOS, j.estilo),
    categoria: nome(TIPOS, j.tipo), lugar: lugarDe(j), geracao: j.geracao ? ROMANOS[j.geracao] : null,
    valores: valoresDe(j.atributos), chamada: j.chamada, notas: j.notas,
    paraQuem: j.paraQuem[0]
  }));
  return `/* Gerado por scripts/build.mjs a partir de dados/. Não edite à mão. */
export const JOGOS = ${JSON.stringify(jogos)};
export const PEDIDOS = ${JSON.stringify(PEDIDOS)};
export const PERGUNTAS = ${JSON.stringify(PERGUNTAS)};
export const DESTAQUES = ${JSON.stringify(DESTAQUES_ABERTURA)};
`;
}
