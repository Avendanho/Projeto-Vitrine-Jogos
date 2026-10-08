/* Modelos das páginas do PokéAtlas. Cada função devolve o HTML de uma página.
 * A Pokédex (lista e página de cada espécie) fica em paginas-pokedex.mjs. */
import { JOGOS } from "../dados/jogos.mjs";
import { ESPECIES } from "../dados/especies.mjs";
import { REGIOES, CONSOLES, ESTILOS, TIPOS, PEDIDOS, MARCOS, HORIZONTE, ROMANOS, MAPAS } from "../dados/atlas.mjs";
import { PERGUNTAS } from "../dados/quiz.mjs";
import { EIXOS, valoresDe, encaixe } from "../src/js/hexagono.js";
import { perfilRegiao, posicoesDosEixos, reguaDeAnos } from "./cenario.mjs";
import { SITE, MAR, TINTA, NOITE, PAPEL, VERMELHO, AMARELO, enumerar, POKEDEX, FICHAS, CARTAS, ORDEM_TIPOS, esc, semAcento, maiuscula, extenso, numero, enderecoEspecie, selo } from "./base.mjs";
import { rotasDaCarta, lugaresDaCarta, tracosDaCarta, caixaCarta } from "./carta.mjs";
import { LINGUAS, PERGUNTAS_EN } from "./textos.mjs";
import { linguaAtual, linksEmIngles, b, ingles } from "./lingua.mjs";
import { MARCOS_EN, HORIZONTE_EN, CARTAS_EN } from "../dados/en.mjs";
import { rotaEmIngles } from "../src/js/lingua-rotas.js";

/* ---------- utilidades ---------- */

const DIA = `data-fundo="${MAR}" data-tinta="${TINTA}"`;
const nome = (lista, id) => lista.find((x) => x.id === id)?.nome ?? id;

export const ORDENADOS = [...JOGOS].sort((a, b) => a.ano - b.ano || (a.tipo === "derivado") - (b.tipo === "derivado"));
const porSlug = Object.fromEntries(JOGOS.map((j) => [j.slug, j]));
const consolesDe = (j, L = LINGUAS[linguaAtual()]) => j.plataformas.map((p) => L.console(CONSOLES.find((c) => c.id === p))).join(` ${L.e} `);
/* O jogo, a região e o console com os textos na língua da página. */
const aqui = (j) => LINGUAS[linguaAtual()].jogo(j);
const regiaoAqui = (r) => LINGUAS[linguaAtual()].regiao(r);
const eixoAqui = (e) => LINGUAS[linguaAtual()].eixo(e);
const consoleAqui = (id) => LINGUAS[linguaAtual()].console(CONSOLES.find((c) => c.id === id));
const categoriaAqui = (id) => LINGUAS[linguaAtual()].categoria(TIPOS.find((c) => c.id === id));
const lugarDe = (j) => (j.regiao === "outras" ? (j.lugar ? maiuscula(j.lugar) : null) : nome(REGIOES, j.regiao));
const ANO_ATUAL = Math.max(...JOGOS.map((j) => j.ano));

function vizinhos(j, n = 3) {
  const v = valoresDe(j.atributos);
  return JOGOS.filter((o) => o.slug !== j.slug)
    .map((o) => ({ o, s: encaixe(v, valoresDe(o.atributos)) }))
    .sort((a, b) => b.s - a.s).slice(0, n).map((x) => x.o);
}

/* O hexágono de atributos de um jogo, como imagem (gerada no build em dist/hex/). */
export function hex(j, opc = {}) {
  const { noite = false, classe = "", alt = "", preguica = true } = opc;
  return `<img class="hex ${classe}" src="/hex/${j.slug}${noite ? "-noite" : ""}.svg" alt="${esc(alt)}" width="480" height="480"${preguica ? ' loading="lazy" decoding="async"' : ""}>`;
}

function prancha(id, L = LINGUAS[linguaAtual()]) {
  const n = String(id).padStart(3, "0");
  return `<figure class="prancha" tabindex="0">
  <span class="prancha-arte">
    <span class="prancha-tinta" style="--arte:url(/arte/pokemon/${id}-tinta.webp)"></span>
    <img class="prancha-cor" src="/arte/pokemon/${id}.webp" alt="${esc(L.prancha.arte(ESPECIES[id]))}" width="440" height="440" loading="lazy" decoding="async">
  </span>
  <figcaption><span class="prancha-numero">${L.prancha.numero} ${n}</span> ${esc(ESPECIES[id])}</figcaption>
</figure>`;
}

function itemHex(original, opc = {}, L = LINGUAS[linguaAtual()]) {
  const j = L.jogo(original);
  return `<a class="hex-item" href="${L.jogos}${j.slug}/">
  ${hex(j, opc)}
  <span class="hex-nome">${esc(j.curto)}</span>
  <span class="hex-meta">${j.ano}, ${esc(consolesDe(j, L))}</span>
</a>`;
}

/* O selo de um tipo na língua da página. (O data-tipo continua em português: é ele que dá a cor e que o filtro lê.) */
const seloEm = (L) => (t) => `<span class="tipo" data-tipo="${semAcento(t)}">${L.tipo(t)}</span>`;

/* ---------- moldura comum ---------- */

/* Roda no cabeçalho, antes de a página aparecer:
 * - marca que há JavaScript, para o CSS poder esconder o que vai se desenhar depois;
 * - o navegador às vezes pula a animação entre duas páginas (por exemplo, se a imagem clicada
 *   ainda não terminou de carregar). A página troca do mesmo jeito, só sem animação, mas ele
 *   registra uma promessa rejeitada. Esse aviso, e só ele, é silenciado. */
const ANTES_DE_APARECER = `document.documentElement.classList.add("js");addEventListener("unhandledrejection",(e)=>{if(e.reason&&e.reason.name==="AbortError"&&/Transition was skipped/.test(e.reason.message))e.preventDefault()})`;

/* O alto-falante do botão de som: com ondas quando ligado, com um xis quando desligado (o CSS escolhe). */
const ICONE_DO_SOM = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path class="som-caixa" d="M3.5 9.5h3.8L12 5.6v12.8l-4.7-3.9H3.5z"/><path class="som-ondas" d="M15.2 9a4.2 4.2 0 0 1 0 6M17.8 6.4a8 8 0 0 1 0 11.2"/><path class="som-mudo" d="M15.6 9.4l5 5.2M20.6 9.4l-5 5.2"/></svg>';

/* O atlas tem duas edições, cada uma com as suas abas, a sua chamada principal e a sua folha de estilo:
 * a edição Pokémon é um aparelho de Pokédex (src/pokedex.css); a do Cobblemon, um mapa em blocos (src/estilo.css). */
export const EDICOES = {
  pokemon: {
    nome: "Pokémon", inicio: "/", cor: VERMELHO, sufixo: "PokéAtlas",
    estilo: "pokedex", fontes: ["mplus-500", "mplus-800"],
    lema: "Um guia para descobrir qual jogo de Pokémon combina com você.",
    acao: { href: "/bussola/", texto: "Abrir a bússola" },
    nav: [
      { href: "/pokedex/", texto: "Pokédex" },
      { href: "/regioes/", texto: "Regiões" },
      { href: "/linha-do-tempo/", texto: "Linha do tempo" },
      { href: "/comparar/", texto: "Comparar" },
      { href: "/desafios/", texto: "Desafios" },
      { href: "/time/", texto: "Time" }
    ],
    avisos: [
      "Projeto de fã, sem fins lucrativos e sem vínculo com Nintendo, Game Freak, Creatures ou The Pokémon Company. Pokémon e os nomes dos jogos pertencem aos seus donos.",
      "As notas de cada jogo são leitura editorial do atlas, não dado oficial. A arte dos Pokémon é a oficial, obtida do repositório público PokeAPI/sprites e reimpressa em gravura; as listas de Pokédex vêm da PokéAPI. As cartas das regiões são redesenhos do atlas sobre os mapas dos jogos. A música e os sons das teclas são do próprio atlas, feitos no navegador; os gritos são os dos jogos, do repositório público PokeAPI/cries. Fontes: M PLUS Rounded 1c e DotGothic16."
    ]
  },
  cobblemon: {
    nome: "Cobblemon", inicio: "/cobblemon/", cor: "#DCCB9F", sufixo: "PokéAtlas, edição Cobblemon",
    estilo: "estilo", fontes: ["archivo", "pixelify"],
    lema: "O atlas do Cobblemon: o que nasce onde, o que se fabrica e jeitos diferentes de jogar.",
    acao: { href: "/cobblemon/desafios/#roleta", texto: "Sortear um desafio" },
    nav: [
      { href: "/cobblemon/pokemon/", texto: "Pokémon" },
      { href: "/cobblemon/itens/", texto: "Itens" },
      { href: "/cobblemon/estruturas/", texto: "Estruturas" },
      { href: "/cobblemon/biomas/", texto: "Biomas" },
      { href: "/cobblemon/cacada/", texto: "Caçada" },
      { href: "/cobblemon/desafios/", texto: "Desafios" }
    ],
    avisos: [
      "Projeto de fã, sem fins lucrativos. Cobblemon é um mod de código aberto feito pela equipe Cobblemon; este site não tem vínculo com ela, nem com a Mojang, a Microsoft, a Nintendo ou a The Pokémon Company.",
      "Os dados vêm dos arquivos do próprio mod (licença MPL 2.0), e os nomes em português são os da tradução dele e a do Minecraft. Os Pokémon são desenhados a partir dos modelos e das texturas do próprio mod, feitos pela equipe do Cobblemon. Os ícones dos itens são as texturas do mod, e as maquetes das estruturas são montadas com as peças dele, em blocos de uma cor só. Nas receitas, os ingredientes do Minecraft são redesenhos em tinta a partir dos ícones do jogo, que pertence à Mojang e à Microsoft. A música e os sons dos menus são do próprio atlas, feitos no navegador; os gritos são os dos jogos de Pokémon, do repositório público PokeAPI/cries. Fontes: Pixelify Sans, Archivo e Alegreya."
    ]
  }
};

/* edicao   "pokemon" ou "cobblemon"
 * espelho  endereço da página equivalente na outra edição (sem ele, o seletor leva ao início dela) */
export function moldura({ titulo, descricao, caminho, classe, corpo, modulo, extra = null, rolagem = false, edicao = "pokemon", espelho = null, lingua = linguaAtual() }) {
  const L = LINGUAS[lingua], C = L.cromo, emIngles = lingua === "en";
  const ed = { ...EDICOES[edicao], ...(L.edicoes?.[edicao] ?? {}) };   // em inglês cada edição tem os seus rótulos e avisos
  const existe = caminho.endsWith("/");               // a página de "não encontrado" não tem endereço próprio
  // `caminho` é sempre o endereço em português; em inglês a página mora no par dele
  const noOutro = rotaEmIngles(caminho), aqui = emIngles ? noOutro : caminho;
  const versoes = existe && noOutro !== caminho ? { "pt-BR": caminho, en: noOutro } : null;   // a página existe nas duas línguas
  const tituloCompleto = caminho === ed.inicio ? titulo : `${titulo} — ${ed.sufixo}`;
  // dentro de uma seção (a página de uma espécie, de uma região), a aba da seção continua marcada
  const link = (n) => `<a href="${n.href}"${caminho.startsWith(n.href) ? ' aria-current="page"' : ""}>${n.texto}</a>`;
  const seletor = Object.entries(EDICOES).map(([id, e]) => (id === edicao
    ? `<a href="${ed.inicio}" aria-current="true"><span>${e.nome}</span></a>`
    : `<a href="${espelho ?? e.inicio}"><span>${e.nome}</span></a>`)).join("");
  // a mesma página na outra língua; o prefixo "pt:" segura o endereço em português na página em inglês
  const outra = versoes && (emIngles ? ["pt-BR", `pt:${caminho}`] : ["en", noOutro]);
  const NOMES = { "pt-BR": "Português", en: "English" };
  // o direcional do rodapé: para os lados, a seção vizinha na ordem das abas; para cima, o alto da página; para baixo, um Pokémon ao acaso
  const voltas = [{ href: ed.inicio, texto: "PokéAtlas" }, ...ed.nav], onde = voltas.findLastIndex((n) => (n.href === ed.inicio ? caminho === n.href : caminho.startsWith(n.href)));
  const vizinha = (passo) => voltas[(Math.max(onde, 0) + passo + voltas.length) % voltas.length];
  const direcional = edicao !== "pokemon" ? "" : `<div class="direcional" role="group" aria-label="${C.direcional}">
    <a class="direcional-cima" href="#conteudo" aria-label="${C.alto}" title="${C.alto}"></a>
    <a class="direcional-esquerda" href="${vizinha(-1).href}" aria-label="${C.anterior(vizinha(-1).texto)}" title="${C.anterior(vizinha(-1).texto)}"></a>
    <a class="direcional-direita" href="${vizinha(1).href}" aria-label="${C.proxima(vizinha(1).texto)}" title="${C.proxima(vizinha(1).texto)}"></a>
    <button type="button" class="direcional-baixo" data-acaso aria-label="${C.acaso}" title="${C.acaso}"></button>
  </div>
  `;
  const html = `<!doctype html>
<html lang="${L.codigo}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloCompleto)}</title>
<meta name="description" content="${esc(descricao)}">
<meta name="theme-color" content="${ed.cor}">
<meta property="og:title" content="${esc(tituloCompleto)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${L.og}">
<meta property="og:site_name" content="PokéAtlas">
<meta property="og:image" content="${SITE}/arte/cartao-${edicao}.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
${existe ? `<meta property="og:url" content="${SITE}${aqui}">\n<link rel="canonical" href="${SITE}${aqui}">` : '<meta name="robots" content="noindex">'}${versoes ? "\n" + Object.entries(versoes).map(([l, href]) => `<link rel="alternate" hreflang="${l}" href="${SITE}${href}">`).join("\n") : ""}
<script>${ANTES_DE_APARECER}</script>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/arte/icone-180.png">
<link rel="manifest" href="/manifest.webmanifest">
${ed.fontes.map((f) => `<link rel="preload" href="/fontes/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n")}
<link rel="stylesheet" href="/${ed.estilo}.css">
</head>
<body class="edicao-${edicao} ${classe}">
<a class="pular" href="#conteudo">${C.pular}</a>
<header class="topo">
  <a class="marca" href="${ed.inicio}"${caminho === ed.inicio ? ' aria-current="page"' : ""}>PokéAtlas</a>
  <div class="edicoes" role="group" aria-label="${C.edicoes}">${seletor}</div>
  <button type="button" class="topo-busca" data-busca-abrir aria-haspopup="dialog" aria-keyshortcuts="/ Control+K">${C.buscar}</button>
  <button type="button" class="topo-som" data-som data-ligado="false" aria-haspopup="dialog" aria-label="${C.som}" title="${C.somTitulo}">${ICONE_DO_SOM}</button>
  <button type="button" class="topo-menu" aria-expanded="false" aria-controls="menu">${C.menu}</button>
  <nav class="topo-nav" id="menu" aria-label="${C.secoes}">
    <button type="button" class="topo-nav-busca" data-busca-abrir aria-haspopup="dialog">${C.buscarNoAtlas}</button>
    <button type="button" class="topo-nav-som" data-som data-ligado="false" aria-haspopup="dialog">${C.musicaESons}</button>
    ${ed.nav.map(link).join("\n    ")}${outra ? `\n    <a class="topo-lingua" href="${outra[1]}" hreflang="${outra[0]}" lang="${outra[0]}">${NOMES[outra[0]]}</a>` : ""}
    <a class="botao botao-pequeno" href="${ed.acao.href}"${caminho === ed.acao.href ? ' aria-current="page"' : ""}>${ed.acao.texto}</a>
  </nav>
</header>
<main id="conteudo">
${corpo}
</main>
<footer class="rodape">
  ${direcional}<div class="rodape-grade">
    <div>
      <p class="marca">PokéAtlas</p>
      <p>${ed.lema}</p>
    </div>
    <nav aria-label="${C.rodape}">
      ${[ed.acao, ...ed.nav].map((n) => `<a href="${n.href.split("#")[0]}">${n.texto}</a>`).join("\n      ")}${outra ? `\n      <a href="${outra[1]}" hreflang="${outra[0]}" lang="${outra[0]}">${NOMES[outra[0]]}</a>` : ""}
    </nav>
    <div class="rodape-avisos">
      ${ed.avisos.map((t) => `<p>${t}</p>`).join("\n      ")}
    </div>
  </div>
</footer>
<script type="module" src="/js/base.js"></script>${rolagem ? '\n<script type="module" src="/js/rolagem.js"></script>' : ""}
${[modulo, extra].filter(Boolean).map((m) => `<script type="module" src="/js/${m}.js"></script>`).join("\n")}
</body>
</html>
`;
  return emIngles ? linksEmIngles(html) : html;
}

/* ---------- início ---------- */

const DESTAQUES_ABERTURA = ["heartgold-soulsilver", "scarlet-violet", "black-white", "legends-arceus", "champions", "red-blue-yellow"];
export const DEMO_COMPARAR = ["red-blue-yellow", "scarlet-violet"];
/* Espécies do mosaico da página inicial, com o tamanho e a força do paralaxe de cada uma. */
const FAVORITOS = [[6, 0.1], [448, 0.22], [25, 0.06], [94, 0.26], [143, 0.12], [700, 0.18], [248, 0.08], [133, 0.2], [384, 0.14]];

function folhaRegiao(regiao, L) {
  const r = L.regiao(regiao), T = L.inicio_;
  const jogos = ORDENADOS.filter((j) => j.regiao === r.id).map(L.jogo);
  return `<article class="folha${CARTAS[r.id].proporcao < 0.7 ? " folha-alta" : ""}">
  <div class="folha-texto-coluna">
    <header class="folha-topo">
      <p class="folha-geracao">${T.geracao} ${ROMANOS[r.geracao]}</p>
      <h3 class="folha-nome"><a href="/regioes/${r.id}/">${r.nome}</a></h3>
      <p class="folha-inspiracao">${esc(r.inspiracao)}</p>
    </header>
    <p class="folha-texto">${esc(r.texto)}</p>
    <div class="folha-iniciais">${r.iniciais.map((id) => prancha(id, L)).join("")}</div>
    <ul class="folha-jogos">
      ${jogos.map((j) => `<li><a href="${L.jogos}${j.slug}/">${hex(j)}<span><span class="hex-nome">${esc(j.curto)}</span><span class="hex-meta">${j.ano}</span></span></a></li>`).join("\n      ")}
    </ul>
  </div>
  ${caixaCarta(r.id, { ligacao: `/regioes/${r.id}/`, rotulo: T.abrirCarta(r.nome) })}
</article>`;
}

/* Os nomes dos seis eixos em volta de um hexágono, cada um no seu vértice. */
const eixosEmVolta = (L, raio = 50) => posicoesDosEixos(raio).map((e) => `<span class="hex-eixo" data-eixo="${e.id}" style="left:${e.x.toFixed(1)}%;top:${e.y.toFixed(1)}%">${L.eixo(e)}</span>`).join("");

export function paginaInicio(lingua = linguaAtual()) {
  const L = LINGUAS[lingua], T = L.inicio_;
  const jogoDe = (slug) => L.jogo(porSlug[slug]);
  const primeiro = jogoDe(DESTAQUES_ABERTURA[0]);
  const [da, db] = DEMO_COMPARAR.map(jogoDe);
  const anos = ANO_ATUAL - ORDENADOS[0].ano, geracoes = Math.max(...REGIOES.map((r) => r.geracao));
  const pedidos = EIXOS.map((e) => {
    const p = L.pedido(PEDIDOS[e.id], e.id), j = jogoDe(p.eleito);
    return `<li data-eixo="${e.id}" data-eleito="${j.slug}">
        <p class="pico-frase">“${esc(p.frase)}”</p>
        <p class="pico-resposta">${T.picoResposta(L.eixo(e), `<a href="${L.jogos}${j.slug}/">${esc(j.curto)}</a>`)}</p>
      </li>`;
  }).join("\n      ");

  const corpo = `
<section class="abertura" ${DIA} aria-labelledby="t-abertura">
  <div class="abertura-visor">
    <div class="hex-vivo abertura-hex">
      <canvas aria-hidden="true"></canvas>
      ${eixosEmVolta(L)}
    </div>
    <p class="abertura-leitura" aria-hidden="true"><span data-leitura-numero>01</span><span>${T.de} ${String(DESTAQUES_ABERTURA.length).padStart(2, "0")}</span><span data-leitura-nota></span></p>
  </div>
  <div class="abertura-texto">
    <h1 class="marca-gigante" id="t-abertura">PokéAtlas</h1>
    <p class="abertura-lema" data-entra="palavras" data-ritmo="1200">${T.lema}</p>
    <div class="abertura-legenda">
      <p>${T.naTela(`<a href="${L.jogos}${primeiro.slug}/" data-perfil-atual>${esc(primeiro.curto)}</a>`)}</p>
      <p>${T.vertices}</p>
    </div>
    <div class="abertura-teclas" role="group" aria-label="${T.teclas}">
      ${DESTAQUES_ABERTURA.map((slug, i) => `<button type="button" data-perfil="${slug}" aria-pressed="${i === 0}">${esc(jogoDe(slug).curto)}</button>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="travessia" data-cena data-telas="6.5" ${DIA} aria-labelledby="t-travessia">
  <div class="palco">
    <div class="trilho" data-trilho>
      <header class="folha-intro">
        <h2 id="t-travessia">${T.cartas(maiuscula(L.extenso(REGIOES.length)))}</h2>
        <p class="prosa">${T.cartasTexto}</p>
      </header>
      ${REGIOES.map((r) => folhaRegiao(r, L)).join("\n      ")}
    </div>
  </div>
</section>

<section class="tempo" ${DIA} aria-labelledby="t-tempo">
  <div class="tempo-grade">
    <div class="tempo-texto">
      <h2 id="t-tempo">${T.anos(maiuscula(L.extenso(anos)))}</h2>
      <p class="prosa">${T.anosTexto}</p>
      <a class="botao botao-contorno" href="/linha-do-tempo/">${T.verLinha}</a>
    </div>
    <dl class="numeros">
      ${[anos, geracoes, REGIOES.length, JOGOS.length].map((n, i) => `<div><dd data-entra="contar" data-ate="${n}">${n}</dd><dt>${T.contas[i]}</dt></div>`).join("\n      ")}
    </dl>
  </div>
  <div class="tempo-regua" data-entra="surgir">
    ${reguaDeAnos(ORDENADOS, HORIZONTE.ano)}
    <p class="regua-chave"><span class="chave chave-cheia"></span>${T.chaveCheia} <span class="chave chave-vazada"></span>${T.chaveVazada}</p>
  </div>
</section>

<section class="pico" data-cena data-telas="7.5" data-fundo="${NOITE}" data-tinta="${PAPEL}" aria-labelledby="t-pico">
  <div class="palco">
    <div class="pico-visor" aria-hidden="true">
      <div class="hex-vivo pico-hex">
        <canvas></canvas>
        ${eixosEmVolta(L)}
      </div>
      <ul class="pico-jogos">
        ${ORDENADOS.map((j, i) => {
          // os trinta perfis ficam num anel em volta do hexágono, em ordem de lançamento, a partir do alto;
          // o nome de cada um abre para dentro do anel
          const a = (i / ORDENADOS.length) * Math.PI * 2 - Math.PI / 2, x = Math.cos(a), y = Math.sin(a);
          const lado = [x < -0.4 ? "nome-esquerda" : x > 0.4 ? "nome-direita" : "", y > 0.3 ? "nome-acima" : ""].filter(Boolean).join(" ");
          return `<li data-slug="${j.slug}"${lado ? ` class="${lado}"` : ""} style="left:${(50 + x * 45.5).toFixed(2)}%;top:${(50 + y * 45.5).toFixed(2)}%"><img src="/hex/${j.slug}-noite.svg" alt="" width="96" height="96" loading="lazy" decoding="async"><span>${esc(L.jogo(j).curto)}</span></li>`;
        }).join("")}
      </ul>
    </div>
    <div class="pico-texto">
      <h2 id="t-pico">${T.pico(maiuscula(L.extenso(JOGOS.length)))}</h2>
      <div class="pico-roteiro">
        <p class="pico-abre">${T.picoAbre}</p>
        <ol class="pico-pedidos">
      ${pedidos}
        </ol>
        <div class="pico-final">
          <p>${T.picoFinal}</p>
          <a class="botao" href="${L.bussola}">${T.abrirBussola}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="ferramentas" ${DIA}>
  <div class="ferramenta ferramenta-pokedex">
    <ul class="mosaico mosaico-especies" aria-label="${T.mosaico}">
      ${FAVORITOS.map(([e, forca]) => `<li class="mosaico-item" data-deriva="${forca}"><a href="${enderecoEspecie(e)}" aria-label="${esc(FICHAS[e].nome)}"><img src="/arte/mini/${e}.webp" alt="" width="184" height="184" loading="lazy" decoding="async"></a></li>`).join("\n      ")}
    </ul>
    <div class="ferramenta-texto">
      <h2>${T.pokedex}</h2>
      <p class="prosa">${T.pokedexTexto(L.numero(Object.keys(FICHAS).length))}</p>
      <form class="busca-inicio" action="/pokedex/" method="get" role="search">
        <label for="pokemon-inicio">${T.procurar}</label>
        <div class="busca-inicio-linha">
          <input id="pokemon-inicio" name="q" type="search" placeholder="Lucario" autocomplete="off" spellcheck="false">
          <button class="botao" type="submit">${T.abrirPokedex}</button>
        </div>
      </form>
    </div>
  </div>
  <div class="ferramenta ferramenta-comparar">
    <div class="ferramenta-texto">
      <h2>${T.sobrepor}</h2>
      <p class="prosa">${T.sobreporTexto}</p>
      <a class="botao botao-contorno" href="/comparar/?a=${da.slug}&amp;b=${db.slug}">${T.comparar}</a>
    </div>
    <figure class="sobreposicao">
      <div class="sobreposicao-hex" aria-hidden="true">
        <img src="/hex/grade.svg" alt="" width="480" height="480" loading="lazy">
        <img src="/hex/demo-a.svg" alt="" width="480" height="480" loading="lazy" data-segue="10">
        <img src="/hex/demo-b.svg" alt="" width="480" height="480" loading="lazy" data-segue="-10">
      </div>
      <figcaption><span class="serie serie-a"></span>${esc(da.curto)} <span class="serie serie-b"></span>${esc(db.curto)}</figcaption>
    </figure>
  </div>
</section>

<section class="fechamento" data-fundo="${AMARELO}" data-tinta="${TINTA}" aria-labelledby="t-fechamento">
  <h2 id="t-fechamento" data-entra="palavras" data-ritmo="1400">${T.fecho(L.extenso(JOGOS.length))}</h2>
  <p class="prosa">${T.fechoTexto(maiuscula(L.extenso(PERGUNTAS.length)))}</p>
  <a class="botao botao-grande" href="${L.bussola}">${T.abrirBussola}</a>
</section>`;

  return moldura({
    titulo: T.titulo, descricao: T.descricao, lingua,
    caminho: "/", classe: "pagina-inicio", corpo, modulo: "inicio", rolagem: true
  });
}

/* ---------- página de jogo ---------- */

function barra(nota) {
  return `<span class="estratos" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<span class="estrato${n <= nota ? ` estrato-${n}` : ""}"></span>`).join("")}</span>`;
}

export function paginaJogo(original, lingua = linguaAtual()) {
  const L = LINGUAS[lingua], T = L.jogo_;
  const j = L.jogo(original);
  const i = ORDENADOS.indexOf(original);
  const anterior = ORDENADOS[i - 1] && L.jogo(ORDENADOS[i - 1]), proximo = ORDENADOS[i + 1] && L.jogo(ORDENADOS[i + 1]);
  const lugar = lugarDe(j);
  const eixos = EIXOS.map((e) => ({ ...e, nome: L.eixo(e), nota: j.atributos[e.id] })).sort((a, b) => b.nota - a.nota);
  const perto = vizinhos(original);
  const resumo = eixos.map((e) => `${e.nome} ${e.nota}`).join(", ");
  const ficha = [
    [T.ficha.lancamento, String(j.ano)],
    [T.ficha.console, esc(consolesDe(j, L))],
    lugar ? [j.regiao === "outras" ? T.ficha.cenario : T.ficha.regiao, j.regiao === "outras" ? esc(lugar) : `<a href="/regioes/${j.regiao}/">${esc(lugar)}</a>`] : null,
    j.geracao ? [T.ficha.geracao, ROMANOS[j.geracao]] : null,
    [T.ficha.estilo, esc(L.estilo(ESTILOS.find((e) => e.id === j.estilo)))],
    [T.ficha.categoria, esc(L.categoria(TIPOS.find((c) => c.id === j.tipo)))]
  ].filter(Boolean);
  const pedido = (id) => L.pedido(PEDIDOS[id], id);

  const corpo = `
<article class="jogo" data-slug="${j.slug}">
  <section class="jogo-topo">
    <div class="jogo-texto">
      <p class="migalha"><a href="/linha-do-tempo/">${T.todos}</a></p>
      <h1>${esc(j.titulo)}</h1>
      <p class="jogo-chamada">${esc(j.chamada)}</p>
      <dl class="ficha-tecnica">
        ${ficha.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join("\n        ")}
      </dl>
    </div>
    <figure class="jogo-hex">
      <div class="hex-vivo hex-do-jogo">
        ${hex(j, { preguica: false, alt: T.hexAlt(j.curto, resumo) })}
        <canvas aria-hidden="true"></canvas>
        ${eixosEmVolta(L)}
      </div>
    </figure>
  </section>

  <section class="jogo-leitura" aria-labelledby="t-leitura">
    <h2 id="t-leitura">${T.leitura}</h2>
    <p class="nota-editorial">${T.notas}</p>
    <ul class="leitura-lista">
      ${eixos.map((e) => `<li data-eixo="${e.id}">
        <span class="leitura-eixo">${e.nome}</span>
        ${barra(e.nota)}
        <span class="leitura-nota"><span class="so-leitor">${T.nota[0]}</span>${e.nota}<span class="so-leitor">${T.nota[1]}</span></span>
        <span class="leitura-texto">${esc(j.notas[e.id] ?? `${maiuscula(e.nota >= 4 ? pedido(e.id).alto : e.nota <= 2 ? pedido(e.id).baixo : T.media)}.`)}</span>
      </li>`).join("\n      ")}
    </ul>
  </section>

  <section class="jogo-corpo">
    <div class="prosa">
      ${j.texto.map((p) => `<p>${esc(p)}</p>`).join("\n      ")}
    </div>
    <div class="jogo-listas">
      <div>
        <h2>${T.paraVoce}</h2>
        <ul class="lista-marcada">${j.paraQuem.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <div>
        <h2>${T.talvezNao}</h2>
        <ul class="lista-marcada lista-contra">${j.naoSe.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
    </div>
  </section>

  ${j.regiao === "outras" ? "" : `<section class="jogo-regiao" aria-labelledby="t-regiao">
    ${caixaCarta(j.regiao, { ligacao: `/regioes/${j.regiao}/`, rotulo: T.abrirCarta(lugar) })}
    <div>
      <h2 id="t-regiao">${T.onde}</h2>
      <p class="jogo-regiao-nome">${esc(lugar)}</p>
      <p class="prosa">${esc(L.regiao(REGIOES.find((x) => x.id === j.regiao)).texto)}</p>
      <a class="botao botao-contorno" href="/regioes/${j.regiao}/">${esc(T.abrirCarta(lugar))}</a>
    </div>
  </section>`}

  <section class="jogo-especimes" aria-labelledby="t-especimes">
    <h2 id="t-especimes">${T.especimes}</h2>
    <div class="pranchas">${j.mascotes.map((id) => prancha(id, L)).join("")}</div>
  </section>

  ${secaoPokedex(j, L)}

  <section class="jogo-vizinhas" aria-labelledby="t-vizinhas">
    <h2 id="t-vizinhas">${T.parecidos}</h2>
    <ul class="estante estante-curta">
      ${perto.map((o) => `<li>${itemHex(o, {}, L)}<a class="ligacao" href="/comparar/?a=${j.slug}&amp;b=${o.slug}">${T.compararOsDois}</a></li>`).join("\n      ")}
    </ul>
  </section>

  <nav class="jogo-passos" aria-label="${T.ordem}">
    ${anterior ? `<a href="${L.jogos}${anterior.slug}/"><span>${T.antes}</span>${esc(anterior.curto)}, ${anterior.ano}</a>` : "<span></span>"}
    ${proximo ? `<a href="${L.jogos}${proximo.slug}/"><span>${T.depois}</span>${esc(proximo.curto)}, ${proximo.ano}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    titulo: j.titulo, caminho: `/jogos/${j.slug}/`, classe: "pagina-jogo", corpo, modulo: "jogo", extra: j.pokedex ? "pokedex" : null,
    lingua,
    descricao: T.descricao(j.chamada, j.curto)
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
    const estreias = Object.entries(primeiroPorConsole).filter(([, a]) => a === ano).map(([p]) => consoleAqui(p));
    if (estreias.length) consoleAtual = estreias[estreias.length - 1];
    const salto = i ? ano - anos[i - 1] : 0;
    return `<li class="linha-ano" id="ano-${ano}" data-ano="${ano}" data-console="${esc(consoleAtual)}" style="--salto:${salto}">
      <h2 class="linha-rotulo">${ano}</h2>
      ${marco ? `<p class="linha-marco">${esc(b(marco.texto, MARCOS_EN[marco.ano]))}</p>` : ""}
      ${estreias.length ? `<p class="linha-estreia">${b(`Primeiro jogo do atlas ${estreias.length > 1 ? "nestas plataformas" : "nesta plataforma"}`, `First game in the atlas on ${estreias.length > 1 ? "these platforms" : "this platform"}`)}: ${enumerar(estreias.map(esc))}.</p>` : ""}
      ${jogos.length ? `<ul class="linha-jogos">${jogos.map(aqui).map((j) => `<li data-tipo="${j.tipo}"><a href="/jogos/${j.slug}/">${hex(j)}<span class="linha-jogo-texto"><span class="hex-nome">${esc(j.curto)}</span><span class="hex-meta">${esc(categoriaAqui(j.tipo))}, ${esc(consolesDe(j))}</span><span class="linha-chamada">${esc(j.chamada)}</span></span></a></li>`).join("")}</ul>` : ""}
    </li>`;
  }).join("\n    ");

  const corpo = `
<section class="cabecalho">
  <h1>${b("Linha do tempo", "Timeline")}</h1>
  <p class="prosa">${b(`De ${anos[0]} até hoje, na ordem em que cada jogo chegou. A distância entre dois anos na página acompanha o tempo que passou entre eles.`, `From ${anos[0]} to today, in the order each game arrived. The distance between two years on the page follows the time that passed between them.`)}</p>
  <div class="filtro filtro-linha" role="group" aria-label="${b("Mostrar", "Show")}">
    <div class="filtro-opcoes">
      <button type="button" class="ficha" data-tipo="" aria-pressed="true">${b("Tudo", "All")}</button>
      <button type="button" class="ficha" data-tipo="principal" aria-pressed="false">${b("Série principal", "Main series")}</button>
      <button type="button" class="ficha" data-tipo="remake legends" aria-pressed="false">${b("Remakes e Legends", "Remakes and Legends")}</button>
      <button type="button" class="ficha" data-tipo="derivado" aria-pressed="false">${b("Derivados", "Spin-offs")}</button>
    </div>
  </div>
</section>
<section class="linha">
  <aside class="linha-marcador" aria-hidden="true">
    <span class="linha-marcador-ano" data-ano-atual>${anos[0]}</span>
    <span class="linha-marcador-console" data-console-atual>${esc(consoleAqui(ORDENADOS[0].plataformas[0]))}</span>
  </aside>
  <ol class="linha-anos">
    ${entradas}
    <li class="linha-ano linha-horizonte" id="ano-${HORIZONTE.ano}" data-ano="${HORIZONTE.ano}" data-console="Nintendo Switch 2" style="--salto:${HORIZONTE.ano - anos[anos.length - 1]}">
      <h2 class="linha-rotulo">${HORIZONTE.ano}</h2>
      <p class="linha-marco">${b(`No horizonte: ${esc(HORIZONTE.titulo)}. ${esc(HORIZONTE.texto)}`, `On the horizon: ${esc(HORIZONTE_EN.titulo)}. ${esc(HORIZONTE_EN.texto)}`)}</p>
    </li>
  </ol>
  <nav class="linha-indice" aria-label="${b("Ir para o ano", "Go to year")}">
    ${[...anos, HORIZONTE.ano].map((a) => `<a href="#ano-${a}" data-ano="${a}">${a}</a>`).join("")}
  </nav>
</section>`;

  return moldura({
    titulo: b("Linha do tempo", "Timeline"), caminho: "/linha-do-tempo/", classe: "pagina-linha", corpo, modulo: "linha",
    descricao: b(`A franquia Pokémon de ${anos[0]} a ${HORIZONTE.ano}, jogo a jogo e console a console.`, `The Pokémon franchise from ${anos[0]} to ${HORIZONTE.ano}, game by game and console by console.`)
  });
}

/* ---------- comparar ---------- */

export function paginaComparar() {
  const opcoes = (vazio) => `${vazio ? `<option value="">${b("Nenhum", "None")}</option>` : ""}${ORDENADOS.map(aqui).map((j) => `<option value="${j.slug}">${esc(j.curto)} (${j.ano})</option>`).join("")}`;
  const corpo = `
<section class="cabecalho">
  <h1>${b("Comparar", "Compare")}</h1>
  <p class="prosa">${b("Escolha dois jogos, ou três, e veja os perfis um sobre o outro. Onde os contornos coincidem, eles se parecem.", "Pick two games, or three, and see the profiles one over the other. Where the outlines match, they are alike.")}</p>
  <p><a class="ligacao" href="/comparar/pokemon/">${b("Comparar dois Pokémon, atributo por atributo", "Compare two Pokémon, stat by stat")}</a></p>
</section>
<section class="comparar">
  <noscript><p class="prosa">${b('A comparação precisa de JavaScript para sobrepor os perfis. Sem ele, cada página de jogo, a partir da <a href="/linha-do-tempo/">linha do tempo</a>, traz as mesmas notas.', 'The comparison needs JavaScript to overlay the profiles. Without it, each game page, starting from the <a href="/linha-do-tempo/">timeline</a>, has the same scores.')}</p></noscript>
  <form class="comparar-escolha" aria-label="${b("Jogos a comparar", "Games to compare")}">
    <label class="escolha escolha-a"><span><span class="serie serie-a"></span>${b("Primeiro jogo", "First game")}</span><select name="a">${opcoes(false)}</select></label>
    <label class="escolha escolha-b"><span><span class="serie serie-b"></span>${b("Segundo jogo", "Second game")}</span><select name="b">${opcoes(false)}</select></label>
    <label class="escolha escolha-c"><span><span class="serie serie-c"></span>${b("Terceiro, se quiser", "A third, if you like")}</span><select name="c">${opcoes(true)}</select></label>
  </form>
  <div class="comparar-grade">
    <figure class="comparar-hex">
      <div class="hex-vivo">
        <canvas role="img" aria-label="${b("Perfis dos jogos escolhidos, sobrepostos", "Profiles of the chosen games, overlaid")}"></canvas>
        ${eixosEmVolta(LINGUAS[linguaAtual()])}
      </div>
      <figcaption class="comparar-chave" data-chave></figcaption>
    </figure>
    <div class="comparar-dados">
      <h2>${b("Nota por nota", "Score by score")}</h2>
      <div class="hastes" data-hastes></div>
      <p class="nota-editorial">${b("Notas de 1 a 5, na avaliação do atlas.", "Scores from 1 to 5, in the atlas's own assessment.")}</p>
    </div>
  </div>
  <div class="comparar-veredito" data-veredito aria-live="polite"></div>
  <div class="comparar-tabela">
    <h2>${b("Lado a lado", "Side by side")}</h2>
    <div class="tabela-rolagem"><table data-tabela></table></div>
  </div>
</section>`;

  return moldura({
    titulo: b("Comparar", "Compare"), caminho: "/comparar/", classe: "pagina-comparar", corpo, modulo: "comparar",
    descricao: b("Compare dois ou três jogos de Pokémon: perfis sobrepostos, nota por nota e ficha lado a lado.", "Compare two or three Pokémon games: overlaid profiles, score by score and a side-by-side fact sheet.")
  });
}

/* ---------- bússola ---------- */

export function paginaBussola(lingua = linguaAtual()) {
  const L = LINGUAS[lingua], T = L.bussola_;
  const corpo = `
<section class="bussola" data-estado="perguntas">
  <div class="bussola-coluna">
    <header class="bussola-topo">
      <h1>${T.h1}</h1>
      <p class="bussola-passo" data-passo aria-live="polite">${T.passo(PERGUNTAS.length)}</p>
    </header>
    <div class="bussola-pergunta" data-pergunta>
      <noscript><p class="prosa">${T.semJs}</p></noscript>
    </div>
    <div class="bussola-acoes">
      <button type="button" class="ligacao" data-voltar hidden>${T.voltar}</button>
      <a class="ligacao bussola-atalho" href="/desenhar/">${T.desenhar}</a>
    </div>
  </div>
  <figure class="bussola-hex">
    <div class="hex-vivo">
      <canvas role="img" aria-label="${T.perfil}"></canvas>
      ${eixosEmVolta(L)}
    </div>
    <figcaption data-legenda>${T.legenda}</figcaption>
  </figure>
</section>
<section class="resultado" data-resultado hidden aria-labelledby="t-resultado">
  <h2 id="t-resultado" tabindex="-1">${T.resultado}</h2>
  <p class="prosa" data-resumo></p>
  <ol class="resultado-lista" data-lista></ol>
  <div class="resultado-acoes">
    <button type="button" class="botao botao-contorno" data-refazer>${T.refazer}</button>
    <button type="button" class="ligacao" data-copiar>${T.copiar}</button>
    <span class="so-leitor" aria-live="polite" data-copiado></span>
  </div>
</section>`;

  return moldura({
    titulo: T.titulo, caminho: "/bussola/", classe: "pagina-bussola", corpo, modulo: "bussola", lingua,
    descricao: T.descricao(maiuscula(L.extenso(PERGUNTAS.length)))
  });
}

/* ---------- 404 ---------- */

export function pagina404() {
  const corpo = `
<section class="cabecalho cabecalho-perdido">
  <h1>Este registro não está na Pokédex</h1>
  <p class="prosa">O endereço não leva a lugar nenhum do atlas. A linha do tempo mostra todos os jogos que existem.</p>
  <p><a class="botao" href="/linha-do-tempo/">Ver todos os jogos</a></p>
  <p class="prosa" lang="en">This address leads nowhere in the atlas. <a href="/en/timeline/">The timeline shows every game</a>.</p>
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

function secaoPokedex(j, L = LINGUAS[linguaAtual()]) {
  const T = L.jogo_, selo = seloEm(L);
  if (!j.pokedex) {
    return `<section class="jogo-pokedex" aria-labelledby="t-pokedex">
    <h2 id="t-pokedex">${T.pokedex}</h2>
    <p class="prosa">${esc(j.semPokedex)}</p>
  </section>`;
  }
  const listas = j.pokedex.map(([id, rotulo]) => ({ id, elenco: rotulo === "Elenco", rotulo: L.lista(rotulo), entradas: POKEDEX.dex[id] }));
  const presentes = new Set(listas.flatMap((l) => l.entradas.flatMap(([, e]) => POKEDEX.especies[e][1])));
  const tipos = ORDEM_TIPOS.filter((t) => presentes.has(t));
  const unica = listas.length === 1;
  const titulo = !unica ? T.pokedex : listas[0].elenco ? T.elenco : T.pokedexDe(listas[0].rotulo);
  const gaveta = (l, i) => `<ol class="gaveta" data-lista="${l.id}"${i ? " hidden" : ""}>
      ${l.entradas.map(([n, e]) => {
        const nome = POKEDEX.especies[e][0];
        const regiao = REGIAO_DA_LISTA[l.id];
        const forma = regiao && POKEDEX.formas[regiao][e];
        const [arte, ts] = forma || [e, POKEDEX.especies[e][1]];
        return `<li data-nome="${esc(semAcento(nome))}" data-tipos="${ts.map(semAcento).join(" ")}"><a href="${enderecoEspecie(e)}"><span class="dex-arte"><img src="/arte/mini/${arte}.webp" data-cor="/arte/mini/${arte}-cor.webp" alt="" width="92" height="92" loading="lazy" decoding="async"></span><span class="dex-numero">${String(n).padStart(3, "0")}</span><span class="dex-nome">${esc(nome)}</span>${forma ? `<span class="dex-forma">${T.formaDe(NOME_DA_REGIAO[regiao])}</span>` : ""}<span class="dex-tipos">${ts.map(selo).join(" ")}</span></a></li>`;
      }).join("")}
    </ol>`;
  return `<section class="jogo-pokedex" aria-labelledby="t-pokedex" data-pokedex data-rotulos="${esc(JSON.stringify({ especie: T.especie, especies: T.especies, mostrar: T.mostrar }))}">
    <h2 id="t-pokedex">${titulo}</h2>
    <p class="nota-editorial">${j.pokedexNota ? `${esc(j.pokedexNota)} ` : ""}${listas.some((l) => REGIAO_DA_LISTA[l.id]) ? T.formaNativa : T.formaPadrao}${T.escolha}</p>
    <div class="dex-controles">
      ${unica ? "" : `<div class="filtro-opcoes" role="group" aria-label="${T.lista}">${listas.map((l, i) => `<button type="button" class="ficha" data-aba="${l.id}" aria-pressed="${i === 0}">${esc(l.rotulo)} <span class="dex-conta">${l.entradas.length}</span></button>`).join("")}</div>`}
      <div class="dex-busca">
        <label for="dex-procurar">${T.procurar}</label>
        <input id="dex-procurar" type="search" placeholder="${T.nomeOuNumero}" autocomplete="off" spellcheck="false">
      </div>
      <div class="filtro-opcoes" role="group" aria-label="${T.tipo}">${tipos.map((t) => `<button type="button" class="ficha ficha-tipo" data-tipo="${semAcento(t)}" aria-pressed="false">${L.tipo(t)}</button>`).join("")}</div>
      <p class="dex-resumo" aria-live="polite"><strong data-dex-contagem>${listas[0].entradas.length}</strong> <span data-dex-rotulo>${T.especies}</span></p>
    </div>
    ${listas.map(gaveta).join("\n    ")}
    <p class="dex-mais" hidden><button type="button" class="botao botao-contorno" data-dex-mais>${T.mostrarTodas}</button></p>
    <p class="vazio" data-dex-vazio hidden>${T.vazio}</p>
  </section>`;
}

/* ---------- regiões ---------- */

export function paginaRegiao(original) {
  const r = regiaoAqui(original), i = REGIOES.indexOf(original);
  const anterior = REGIOES[i - 1], proxima = REGIOES[i + 1];
  const mapa = MAPAS[r.id], carta = CARTAS[r.id];
  const pontos = lugaresDaCarta(r.id);
  const rotas = rotasDaCarta(r.id);
  const jogos = ORDENADOS.filter((j) => j.regiao === r.id);
  const alta = carta.proporcao < 0.7;
  const nomeDaCarta = (n) => (ingles() ? CARTAS_EN.nomes[n] ?? n : n);
  const descricao = b(`Carta de ${r.nome}, com ${mapa.cidades.length} ${mapa.cidades.length === 1 ? "povoado marcado" : "cidades marcadas"}${mapa.marcos.length ? ` e ${mapa.marcos.length} ${mapa.marcos.length === 1 ? "marco" : "marcos"}` : ""}. A lista completa vem logo abaixo.`,
    `Map of ${r.nome}, with ${mapa.cidades.length} ${mapa.cidades.length === 1 ? "settlement" : "cities"} marked${mapa.marcos.length ? ` and ${mapa.marcos.length} ${mapa.marcos.length === 1 ? "landmark" : "landmarks"}` : ""}. The full list comes right below.`);

  const corpo = `
<article class="regiao${alta ? " regiao-alta" : ""}">
  <header class="cabecalho">
    <p class="migalha"><a href="/regioes/">${b("Regiões", "Regions")}</a></p>
    <h1>${r.nome}</h1>
    <p class="regiao-meta">${b("Geração", "Generation")} ${ROMANOS[r.geracao]}. ${esc(r.inspiracao)}.</p>
    <p class="prosa">${esc(r.texto)}</p>
  </header>

  <section class="regiao-carta" aria-labelledby="t-carta">
    <h2 id="t-carta" class="so-leitor">${b(`Carta de ${r.nome}`, `Map of ${r.nome}`)}</h2>
    <figure class="carta">
      <div class="carta-caixa carta-grande" data-carta="${r.id}" style="--proporcao:${carta.proporcao}">
        <img class="carta-terreno" src="/cartas/${r.id}.svg" alt="${esc(descricao)}" width="1000" height="${carta.altura}">
        ${tracosDaCarta(r.id, { pontos: false, destacavel: true })}
        <ol class="carta-pontos" aria-hidden="true">
          ${pontos.map((p) => `<li class="ponto ponto-${p.tipo} lado-${p.lado}" data-lugar="${p.n}" style="left:${p.x}%;top:${p.y}%"><span class="ponto-marca">${p.n}</span><span class="ponto-nome">${esc(p.nome)}</span></li>`).join("\n          ")}
          ${(mapa.areas || []).map(([nome, x, y]) => `<li class="ponto-area" style="left:${x}%;top:${y}%">${esc(nomeDaCarta(nome))}</li>`).join("\n          ")}
          ${rotas.map((t, k) => (t.n ? `<li class="rota-numero" data-rota="${k}" style="left:${t.x.toFixed(1)}%;top:${t.y.toFixed(1)}%">${t.n}</li>` : "")).join("")}
        </ol>
      </div>
      <figcaption>${b(`Carta redesenhada pelo atlas a partir do mapa da região nos jogos: a costa segue o original, o relevo é interpretação.${rotas.length ? " As linhas vermelhas são as rotas, cada uma com o seu número." : ""} Aponte ou toque num lugar${rotas.length ? " ou numa rota" : ""} para destacá-lo.${mapa.nota ? ` ${esc(mapa.nota)}` : ""}`,
        `Map redrawn by the atlas from the region's map in the games: the coastline follows the original, the terrain is interpretation.${rotas.length ? " The red lines are the routes, each with its number." : ""} Point at or tap a place${rotas.length ? " or a route" : ""} to highlight it.${mapa.nota ? ` ${esc(CARTAS_EN.nota[r.id])}` : ""}`)}</figcaption>
    </figure>
    <div class="carta-legenda">
      <h2>${b("Lugares na carta", "Places on the map")}</h2>
      <ol class="legenda-lista">
        ${pontos.map((p) => `<li class="legenda-${p.tipo}" data-lugar="${p.n}"><span class="ponto-marca" aria-hidden="true">${p.n}</span>${esc(p.nome)}</li>`).join("\n        ")}
      </ol>
      ${(mapa.areas || []).length ? `<p class="nota-editorial">${b("Também na carta, sem número", "Also on the map, with no number")}: ${mapa.areas.map(([n]) => esc(nomeDaCarta(n))).join(", ")}.</p>` : ""}
      <h2 class="legenda-rotas">${b("Rotas", "Routes")}</h2>
      ${rotas.length ? `<ul class="rotas-lista">
        ${rotas.map((t, k) => `<li data-rota="${k}"><span class="rota-n${t.n ? "" : " rota-sem"}">${t.n || b("sem nº", "no number")}</span><span>${t.nome ? `${esc(t.nome)}. ` : ""}${esc(t.texto)}</span></li>`).join("\n        ")}
      </ul>
      <p class="nota-editorial">${b("Rotas vizinhas que formam um só caminho aparecem juntas, como “3–4”. Trechos sem número são pontes, túneis e travessias que os jogos não numeram.", "Neighboring routes that form a single path appear together, as in “3–4”. Stretches with no number are bridges, tunnels and crossings that the games do not number.")}</p>` : `<p class="prosa">${esc(b(mapa.semRotas, CARTAS_EN.semRotas[r.id]))}</p>`}
    </div>
  </section>

  <section class="regiao-iniciais" aria-labelledby="t-iniciais">
    <h2 id="t-iniciais">${b("Primeiros companheiros", "First partners")}</h2>
    <div class="pranchas">${r.iniciais.map((id) => prancha(id)).join("")}</div>
  </section>

  <section class="regiao-jogos" aria-labelledby="t-jogos">
    <h2 id="t-jogos">${jogos.length === 1 ? b("O jogo que se passa aqui", "The game set here") : b("Jogos que se passam aqui", "Games set here")}</h2>
    <ul class="estante estante-curta">
      ${jogos.map((j) => `<li>${itemHex(j)}${j.pokedex ? `<a class="ligacao" href="/jogos/${j.slug}/#t-pokedex">${b("Ver a Pokédex", "See the Pokédex")}</a>` : ""}</li>`).join("\n      ")}
    </ul>
  </section>

  <div class="regiao-perfil" aria-hidden="true">${perfilRegiao(r.cenario)}</div>

  <nav class="jogo-passos" aria-label="${b("Outras regiões", "Other regions")}">
    ${anterior ? `<a href="/regioes/${anterior.id}/"><span>${b("Carta anterior", "Previous map")}</span>${anterior.nome}</a>` : "<span></span>"}
    ${proxima ? `<a href="/regioes/${proxima.id}/"><span>${b("Próxima carta", "Next map")}</span>${proxima.nome}</a>` : "<span></span>"}
  </nav>
</article>`;

  return moldura({
    titulo: b(`${r.nome}, a carta da região`, `${r.nome}, the map of the region`), caminho: `/regioes/${r.id}/`, classe: "pagina-regiao", corpo, modulo: "regiao",
    descricao: b(`${r.texto} Veja a carta de ${r.nome}, as cidades, os iniciais e os jogos que se passam nela.`, `${r.texto} See the map of ${r.nome}, its cities, its first partners and the games set in it.`)
  });
}

/* A chave das cartas: as cinco faixas de altitude e os três símbolos. */
function chaveDasCartas() {
  const faixas = [1, 2, 3, 4, 5].map((n) => `<span style="background:var(--terra-${n})"></span>`).join("");
  return `<li class="regioes-chave">
      <h2>${b("Como ler as cartas", "How to read the maps")}</h2>
      <dl>
        <div><dt><span class="chave-faixas" aria-hidden="true">${faixas}</span></dt><dd>${b("Altitude, da costa ao cume", "Elevation, from coast to summit")}</dd></div>
        <div><dt><svg viewBox="0 0 44 14" aria-hidden="true"><path d="M2 7H42" class="chave-rota"/></svg></dt><dd>${b("Rota", "Route")}</dd></div>
        <div><dt><svg viewBox="0 0 44 14" aria-hidden="true"><circle cx="22" cy="7" r="4.5" class="chave-cidade"/></svg></dt><dd>${b("Cidade ou vila", "City or town")}</dd></div>
        <div><dt><svg viewBox="0 0 44 14" aria-hidden="true"><rect x="18" y="3" width="8" height="8" transform="rotate(45 22 7)" class="chave-marco"/></svg></dt><dd>${b("Caverna, lago, torre ou outro marco", "Cave, lake, tower or other landmark")}</dd></div>
      </dl>
      <p>${b("A costa de cada carta segue o mapa dos jogos. O relevo é interpretação do atlas.", "The coastline of each map follows the map from the games. The terrain is the atlas's interpretation.")}</p>
    </li>`;
}

export function paginaRegioes() {
  const corpo = `
<section class="cabecalho">
  <h1>${b("Regiões", "Regions")}</h1>
  <p class="prosa">${b(`${maiuscula(extenso(REGIOES.length))} cartas, redesenhadas a partir dos mapas dos jogos. Abra uma para ver os nomes das cidades, as rotas numeradas e os jogos que se passam ali.`, `${maiuscula(extenso(REGIOES.length))} maps, redrawn from the maps in the games. Open one to see the names of the cities, the numbered routes and the games set there.`)}</p>
</section>
<section class="regioes">
  <ul class="regioes-lista">
    ${REGIOES.map(regiaoAqui).map((r) => `<li${CARTAS[r.id].proporcao < 0.7 ? ' class="regioes-alta"' : ""}>
      ${caixaCarta(r.id, { ligacao: `/regioes/${r.id}/`, rotulo: b(`Carta de ${r.nome}`, `Map of ${r.nome}`) })}
      <a class="regioes-nome" href="/regioes/${r.id}/">${r.nome}</a>
      <span class="hex-meta">${b("Geração", "Generation")} ${ROMANOS[r.geracao]}. ${esc(r.inspiracao)}</span>
    </li>`).join("\n    ")}
    ${chaveDasCartas()}
  </ul>
</section>`;
  return moldura({
    titulo: b("Regiões", "Regions"), caminho: "/regioes/", classe: "pagina-regioes", corpo,
    descricao: b(`As ${REGIOES.length} regiões de Pokémon em cartas redesenhadas, de Kanto a Paldea, com cidades, rotas e os jogos de cada uma.`, `The ${REGIOES.length} Pokémon regions as redrawn maps, from Kanto to Paldea, with cities, routes and the games of each one.`)
  });
}

/* ---------- dados enviados ao navegador ---------- */

export function dadosDoNavegador(lingua = linguaAtual()) {
  const L = LINGUAS[lingua], ingles = lingua === "en";
  const jogos = ORDENADOS.map(L.jogo).map((j) => ({
    slug: j.slug, titulo: j.titulo, curto: j.curto, ano: j.ano, tipo: j.tipo,
    plataformas: j.plataformas, consoles: j.plataformas.map((p) => L.console(CONSOLES.find((c) => c.id === p))).join(` ${L.e} `),
    estilo: L.estilo(ESTILOS.find((e) => e.id === j.estilo)), categoria: L.categoria(TIPOS.find((c) => c.id === j.tipo)), lugar: lugarDe(j), geracao: j.geracao ? ROMANOS[j.geracao] : null, paraQuem: j.paraQuem[0],
    valores: valoresDe(j.atributos), chamada: j.chamada, notas: j.notas
  }));
  const pedidos = Object.fromEntries(Object.entries(PEDIDOS).map(([id, p]) => [id, L.pedido(p, id)]));
  const perguntas = ingles ? PERGUNTAS.map((p, q) => ({ ...p, pergunta: PERGUNTAS_EN[q].pergunta, opcoes: p.opcoes.map((o, i) => ({ ...o, texto: PERGUNTAS_EN[q].opcoes[i] })) })) : PERGUNTAS;
  return `/* Gerado por scripts/build.mjs a partir de dados/. Não edite à mão. */
export const JOGOS = ${JSON.stringify(jogos)};
export const PEDIDOS = ${JSON.stringify(pedidos)};
export const PERGUNTAS = ${JSON.stringify(perguntas)};
export const DESTAQUES = ${JSON.stringify(DESTAQUES_ABERTURA)};
export const NOMES_DOS_EIXOS = ${JSON.stringify(Object.fromEntries(EIXOS.map((e) => [e.id, L.eixo(e)])))};
`;
}
