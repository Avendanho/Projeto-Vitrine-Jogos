import { test } from "node:test";
import assert from "node:assert/strict";
import { emIngles, LINGUAS } from "../scripts/textos.mjs";
import { JOGOS } from "../dados/jogos.mjs";

test("números por extenso em inglês", () => {
  assert.deepEqual([0, 8, 10, 13, 20, 21, 30, 45, 99].map(emIngles), ["zero", "eight", "ten", "thirteen", "twenty", "twenty-one", "thirty", "forty-five", "ninety-nine"]);
});

test("as duas línguas têm as mesmas frases", () => {
  const pt = LINGUAS["pt-BR"], en = LINGUAS.en;
  for (const grupo of ["cromo", "inicio_", "bussola_", "jogo_", "prancha"]) assert.deepEqual(Object.keys(en[grupo]).sort(), Object.keys(pt[grupo]).sort(), grupo);
});

test("um jogo em inglês troca o texto e mantém o resto", () => {
  const original = JOGOS.find((j) => j.slug === "red-blue-yellow"), ingles = LINGUAS.en.jogo(original);
  assert.equal(ingles.titulo, "Pokémon Red, Blue and Yellow");
  assert.equal(ingles.curto, "Red, Blue and Yellow");
  assert.notEqual(ingles.chamada, original.chamada);
  assert.deepEqual(ingles.atributos, original.atributos);
  assert.equal(LINGUAS["pt-BR"].jogo(original), original);
});

test("os endereços vão e voltam entre as duas línguas", async () => {
  const { rotaEmIngles, rotaEmPortugues, ROTAS } = await import("../src/js/lingua-rotas.js");
  assert.equal(rotaEmIngles("/"), "/en/");
  assert.equal(rotaEmIngles("/pokedex/charizard/"), "/en/pokedex/charizard/");
  assert.equal(rotaEmIngles("/comparar/pokemon/"), "/en/compare/pokemon/", "o prefixo mais específico vence");
  assert.equal(rotaEmIngles("/arte/mini/6.webp"), "/arte/mini/6.webp", "arquivo não muda de endereço");
  for (const [pt] of ROTAS) assert.equal(rotaEmPortugues(rotaEmIngles(`${pt}x/`)), `${pt}x/`);
  assert.equal(rotaEmPortugues("/en/"), "/");
});

test("os tipos têm o mesmo nome em inglês no build e no navegador", async () => {
  const navegador = (await import("../src/js/lingua.js")).TIPOS_EN, build = (await import("../dados/en.mjs")).TIPOS_EN;
  assert.deepEqual(navegador, build);
  assert.equal(Object.keys(build).length, 18);
});

test("os links de uma página em inglês são trocados, menos o que aponta de volta para o português", async () => {
  const { linksEmIngles } = await import("../scripts/lingua.mjs");
  const html = '<a href="/pokedex/?tipo=fogo">a</a><a href="pt:/pokedex/">b</a><img src="/arte/x.webp"><form action="/pokedex/"><a href="#conteudo">c</a><a href="/regioes/kanto/#t">d</a>';
  assert.equal(linksEmIngles(html), '<a href="/en/pokedex/?tipo=fogo">a</a><a href="/pokedex/">b</a><img src="/arte/x.webp"><form action="/en/pokedex/"><a href="#conteudo">c</a><a href="/en/regions/kanto/#t">d</a>');
});
