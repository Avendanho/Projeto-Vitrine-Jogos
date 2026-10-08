#!/usr/bin/env node
/* Gera o site estático em dist/ a partir de dados/ e src/. Sem dependências. */
import { mkdir, rm, writeFile, cp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JOGOS } from "../dados/jogos.mjs";
import { ESPECIES } from "../dados/especies.mjs";
import { REGIOES, CONSOLES, ESTILOS, PEDIDOS, MAPAS, ROTAS } from "../dados/atlas.mjs";
import { terrenoSVG } from "./cenario.mjs";
import { POKEDEX, FICHAS, CARTAS, COBBLEMON, SITE, VERMELHO } from "./base.mjs";
import { FAVICON } from "./icone.mjs";
import { PERGUNTAS } from "../dados/quiz.mjs";
import { EIXOS_EN, JOGOS_EN, FICHAS_EN, REGIOES_EN, PEDIDOS_EN, PERGUNTAS_EN, ESTILOS_EN, CATEGORIAS_EN, TIPOS_EN } from "../dados/en.mjs";
import { TIPOS as CATEGORIAS } from "../dados/atlas.mjs";
import { ORDEM_TIPOS } from "./base.mjs";
import { paginaPokedex, paginaEspecie, TODAS_AS_ESPECIES } from "./paginas-pokedex.mjs";
import {
  paginaCobblemonInicio, paginaCobblemonPokemon, paginaCobblemonEspecie, paginaCobblemonItens,
  paginaCobblemonEstruturas, paginaCobblemonBiomas, paginaCobblemonCacada, ESPECIES_DO_COBBLEMON
} from "./paginas-cobblemon.mjs";
import { paginaCompararPokemon, paginaTime, paginaDiario, paginaTipos, paginaDesenhar } from "./paginas-ferramentas.mjs";
import { moduloEspecies, moduloTipos, moduloJogos, moduloSpawns, moduloBusca, moduloNumeros } from "./dados-navegador.mjs";
import { paginaDesafios, paginaDesafio, dadosDaRoleta, TODOS_OS_DESAFIOS, enderecoDoDesafio } from "./paginas-desafios.mjs";
import { svgHexagono, gradeDoHexagono, valoresDe, EIXOS, TEMAS } from "../src/js/hexagono.js";
import {
  paginaInicio, paginaJogo, paginaLinha, paginaComparar, paginaBussola,
  paginaRegiao, paginaRegioes, pagina404, dadosDoNavegador, DEMO_COMPARAR
} from "./paginas.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(RAIZ, "src");
const DIST = join(RAIZ, "dist");

/* ---------- conferência dos dados: melhor falhar no build do que publicar errado ---------- */

function conferir() {
  const erros = [];
  const slugs = new Set();
  for (const j of JOGOS) {
    if (slugs.has(j.slug)) erros.push(`slug repetido: ${j.slug}`);
    slugs.add(j.slug);
    for (const e of EIXOS) {
      const n = j.atributos[e.id];
      if (!Number.isInteger(n) || n < 1 || n > 5) erros.push(`${j.slug}: nota de ${e.id} fora de 1 a 5`);
    }
    for (const p of j.plataformas) if (!CONSOLES.some((c) => c.id === p)) erros.push(`${j.slug}: console desconhecido ${p}`);
    if (!ESTILOS.some((e) => e.id === j.estilo)) erros.push(`${j.slug}: estilo desconhecido ${j.estilo}`);
    if (j.regiao !== "outras" && !REGIOES.some((r) => r.id === j.regiao)) erros.push(`${j.slug}: região desconhecida ${j.regiao}`);
    for (const m of j.mascotes) if (!ESPECIES[m]) erros.push(`${j.slug}: espécie ${m} sem nome em especies.mjs`);
    if (!j.pokedex && !j.semPokedex) erros.push(`${j.slug}: falta "pokedex" ou "semPokedex"`);
    for (const [id] of j.pokedex || []) if (!POKEDEX.dex[id]) erros.push(`${j.slug}: Pokédex ${id} não existe em pokedex.json`);
  }
  for (const id of Object.keys(POKEDEX.especies)) if (!FICHAS[id]) erros.push(`espécie ${id} sem ficha em fichas.json (rode scripts/fichas.mjs)`);
  const slugsDeDesafio = new Set();
  for (const d of TODOS_OS_DESAFIOS) {
    if (slugsDeDesafio.has(d.slug)) erros.push(`desafio repetido: ${d.slug}`);
    slugsDeDesafio.add(d.slug);
    for (const campo of ["dificuldade", "caos"]) if (!(d[campo] >= 1 && d[campo] <= 5)) erros.push(`desafio ${d.slug}: ${campo} fora de 1 a 5`);
    for (const j of d.jogos || []) if (!JOGOS.some((x) => x.slug === j)) erros.push(`desafio ${d.slug}: jogo ${j} não existe`);
    if (d.regiao && !REGIOES.some((r) => r.id === d.regiao)) erros.push(`desafio ${d.slug}: região ${d.regiao} não existe`);
    for (const n of d.especies) {
      if (!FICHAS[n]) erros.push(`desafio ${d.slug}: espécie ${n} não existe`);
      else if (d.edicao === "cobblemon" && !COBBLEMON.especies[n]?.impl) erros.push(`desafio ${d.slug}: ${FICHAS[n].nome} não está no Cobblemon`);
    }
  }
  for (const r of REGIOES) {
    if (!CARTAS[r.id]) erros.push(`${r.id}: sem traçado em cartas.json (rode scripts/cartas.mjs)`);
    const m = MAPAS[r.id];
    if (!m) { erros.push(`${r.id}: sem lugares em MAPAS`); continue; }
    const rotas = ROTAS[r.id] || [];
    if (!rotas.length && !m.semRotas) erros.push(`${r.id}: sem rotas e sem a frase "semRotas"`);
    const calculadas = rotas.filter((t) => !t.pts).length;
    if (calculadas && (CARTAS[r.id]?.rotas || []).length !== rotas.length) erros.push(`${r.id}: rotas de cartas.json fora de sincronia com ROTAS (rode scripts/cartas.mjs)`);
    const nomes = new Set([...m.cidades, ...m.marcos].map((l) => l[0]));
    for (const t of rotas) for (const ponta of [t.de, t.para]) if (typeof ponta === "string" && !nomes.has(ponta)) erros.push(`${r.id}: rota ${t.n || t.nome} cita "${ponta}", que não está na carta`);
    for (const [nome, x, y] of [...m.cidades, ...m.marcos, ...(m.areas || [])]) {
      if (!(x >= 0 && x <= 100 && y >= 0 && y <= 100)) erros.push(`${r.id}: ${nome} fora do quadro`);
    }
  }
  for (const r of REGIOES) for (const m of r.iniciais) if (!ESPECIES[m]) erros.push(`${r.id}: inicial ${m} sem nome`);
  for (const [eixo, p] of Object.entries(PEDIDOS)) {
    const j = JOGOS.find((x) => x.slug === p.eleito);
    if (!j) { erros.push(`pedido ${eixo}: jogo ${p.eleito} não existe`); continue; }
    const maximo = Math.max(...JOGOS.map((x) => x.atributos[eixo]));
    if (j.atributos[eixo] !== maximo) erros.push(`pedido ${eixo}: ${p.eleito} não tem a nota máxima do eixo`);
  }
  // a versão em inglês acompanha o original: nenhum jogo, nota, região, pedido ou pergunta fica sem tradução
  for (const e of EIXOS) if (!EIXOS_EN[e.id]) erros.push(`inglês: falta o nome do eixo ${e.id}`);
  for (const j of JOGOS) {
    const en = JOGOS_EN[j.slug];
    if (!en?.chamada) { erros.push(`inglês: falta a chamada de ${j.slug}`); continue; }
    const pt = Object.keys(j.notas || {}).sort().join(), ing = Object.keys(en.notas || {}).sort().join();
    if (pt !== ing) erros.push(`inglês: as notas de ${j.slug} não batem com o original (${pt} / ${ing})`);
    const ficha = FICHAS_EN[j.slug];
    if (!ficha) { erros.push(`inglês: falta a ficha de ${j.slug}`); continue; }
    for (const campo of ["texto", "paraQuem", "naoSe"]) if (ficha[campo]?.length !== j[campo].length) erros.push(`inglês: "${campo}" de ${j.slug} tem outro tamanho`);
    for (const campo of ["pokedexNota", "semPokedex", "lugar"]) if (Boolean(j[campo]) !== Boolean(ficha[campo])) erros.push(`inglês: "${campo}" de ${j.slug} não acompanha o original`);
  }
  for (const e of ESTILOS) if (!ESTILOS_EN[e.id]) erros.push(`inglês: falta o estilo ${e.id}`);
  for (const c of CATEGORIAS) if (!CATEGORIAS_EN[c.id]) erros.push(`inglês: falta a categoria ${c.id}`);
  for (const tipo of ORDEM_TIPOS) if (!TIPOS_EN[tipo]) erros.push(`inglês: falta o tipo ${tipo}`);
  for (const r of REGIOES) if (!REGIOES_EN[r.id]?.texto || !REGIOES_EN[r.id]?.inspiracao) erros.push(`inglês: falta o texto da região ${r.id}`);
  for (const id of Object.keys(PEDIDOS)) for (const campo of ["frase", "alto", "baixo"]) if (!PEDIDOS_EN[id]?.[campo]) erros.push(`inglês: falta "${campo}" do pedido ${id}`);
  if (PERGUNTAS_EN.length !== PERGUNTAS.length) erros.push("inglês: o número de perguntas da bússola não bate");
  PERGUNTAS.forEach((p, q) => { if (PERGUNTAS_EN[q]?.opcoes.length !== p.opcoes.length) erros.push(`inglês: a pergunta ${q + 1} da bússola tem outro número de opções`); });
  if (erros.length) {
    console.error("Dados inconsistentes:\n  " + erros.join("\n  "));
    process.exit(1);
  }
}

let paginas = 0;                                    // conta as páginas de verdade, para o resumo do fim não depender de soma feita à mão
const enderecos = [];                               // e guarda o endereço de cada uma, para o mapa do site
async function escrever(caminho, conteudo) {
  if (caminho.endsWith(".html")) {
    paginas++;
    if (caminho.endsWith("index.html")) enderecos.push(`/${caminho.slice(0, -"index.html".length)}`);
  }
  const destino = join(DIST, caminho);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, conteudo, "utf8");
}


/* ---------- build ---------- */

const inicio = Date.now();
conferir();
await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });

await Promise.all([
  cp(join(SRC, "estilo.css"), join(DIST, "estilo.css")),
  cp(join(SRC, "pokedex.css"), join(DIST, "pokedex.css")),
  cp(join(SRC, "js"), join(DIST, "js"), { recursive: true }),
  cp(join(SRC, "fontes"), join(DIST, "fontes"), { recursive: true }),
  cp(join(SRC, "arte"), join(DIST, "arte"), { recursive: true }),
  cp(join(SRC, "maquetes"), join(DIST, "maquetes"), { recursive: true }),
  cp(join(SRC, "gritos"), join(DIST, "gritos"), { recursive: true }),
  cp(join(SRC, "modelos3d"), join(DIST, "modelos3d"), { recursive: true })
]);

/* O hexágono de cada jogo, na tela clara e na tela apagada; a grade sozinha e os dois contornos da demonstração de comparar. */
for (const j of JOGOS) {
  const v = valoresDe(j.atributos);
  await escrever(`hex/${j.slug}.svg`, svgHexagono(v, "tela"));
  await escrever(`hex/${j.slug}-noite.svg`, svgHexagono(v, "noite"));
}
const [demoA, demoB] = DEMO_COMPARAR.map((slug) => JOGOS.find((j) => j.slug === slug));
await escrever("hex/grade.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480">${gradeDoHexagono(480, TEMAS.tela)}</svg>`);
await escrever("hex/demo-a.svg", svgHexagono(valoresDe(demoA.atributos), "#2F6FDB"));
await escrever("hex/demo-b.svg", svgHexagono(valoresDe(demoB.atributos), "#DC0A2D"));

for (const r of REGIOES) await escrever(`cartas/${r.id}.svg`, terrenoSVG(CARTAS[r.id]));

await escrever("js/dados.js", dadosDoNavegador());
await escrever("js/dados-en.js", dadosDoNavegador("en"));
await escrever("regioes/index.html", paginaRegioes());
for (const r of REGIOES) await escrever(`regioes/${r.id}/index.html`, paginaRegiao(r));
await escrever("favicon.svg", FAVICON);
await escrever("index.html", paginaInicio());
await escrever("en/index.html", paginaInicio("en"));
await escrever("pokedex/index.html", paginaPokedex());
for (const id of TODAS_AS_ESPECIES) await escrever(`pokedex/${FICHAS[id].slug}/index.html`, paginaEspecie(id));
await escrever("linha-do-tempo/index.html", paginaLinha());
await escrever("comparar/index.html", paginaComparar());
await escrever("comparar/pokemon/index.html", paginaCompararPokemon());
await escrever("js/dados/especies.js", moduloEspecies());
await escrever("time/index.html", paginaTime());
await escrever("tipos/index.html", paginaTipos());
await escrever("desenhar/index.html", paginaDesenhar());
await escrever("js/dados/numeros.js", moduloNumeros());
await escrever("diario/index.html", paginaDiario());
await escrever("js/dados/tipos.js", moduloTipos());
await escrever("js/dados/jogos.js", moduloJogos());
await escrever("bussola/index.html", paginaBussola());
await escrever("en/compass/index.html", paginaBussola("en"));
await escrever("404.html", pagina404());
for (const j of JOGOS) {
  await escrever(`jogos/${j.slug}/index.html`, paginaJogo(j));
  await escrever(`en/games/${j.slug}/index.html`, paginaJogo(j, "en"));
}

// edição Cobblemon
await escrever("cobblemon/index.html", paginaCobblemonInicio());
await escrever("cobblemon/pokemon/index.html", paginaCobblemonPokemon());
for (const n of ESPECIES_DO_COBBLEMON) await escrever(`cobblemon/pokemon/${FICHAS[n].slug}/index.html`, paginaCobblemonEspecie(n));
await escrever("cobblemon/itens/index.html", paginaCobblemonItens());
await escrever("cobblemon/estruturas/index.html", paginaCobblemonEstruturas());
await escrever("cobblemon/biomas/index.html", paginaCobblemonBiomas());
await escrever("cobblemon/cacada/index.html", paginaCobblemonCacada());
await escrever("js/dados/spawns.js", moduloSpawns());
await escrever("js/dados/busca.js", moduloBusca());

// desafios, nas duas edições
for (const edicao of ["pokemon", "cobblemon"]) {
  await escrever(`${edicao === "cobblemon" ? "cobblemon/" : ""}desafios/index.html`, paginaDesafios(edicao));
  await escrever(`js/roleta-${edicao}.js`, dadosDaRoleta(edicao));
}
for (const d of TODOS_OS_DESAFIOS) await escrever(`${enderecoDoDesafio(d).slice(1)}index.html`, paginaDesafio(d));

/* O mapa do site e o aviso aos buscadores de onde ele está. */
await escrever("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${enderecos.sort().map((e) => `<url><loc>${SITE}${e}</loc></url>`).join("\n")}\n</urlset>\n`);
await escrever("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* O que o celular precisa para instalar o atlas na tela inicial. Os ícones são feitos por scripts/vitrine.mjs. */
await escrever("manifest.webmanifest", JSON.stringify({
  name: "PokéAtlas", short_name: "PokéAtlas", lang: "pt-BR", dir: "ltr",
  description: "Um guia visual para descobrir qual jogo de Pokémon combina com você. Projeto de fã, não oficial.",
  start_url: "/", scope: "/", display: "standalone", background_color: VERMELHO, theme_color: VERMELHO,
  icons: [
    { src: "/arte/icone-192.png", sizes: "192x192", type: "image/png" },
    { src: "/arte/icone-512.png", sizes: "512x512", type: "image/png" },
    { src: "/arte/icone-cheio-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
  ]
}, null, 1));

console.log(`PokéAtlas: ${JOGOS.length} jogos, ${REGIOES.length} regiões, ${TODAS_AS_ESPECIES.length} espécies, ` +
  `${ESPECIES_DO_COBBLEMON.length} do Cobblemon, ${TODOS_OS_DESAFIOS.length} desafios; ${paginas} páginas em dist/ (${Date.now() - inicio} ms)`);
