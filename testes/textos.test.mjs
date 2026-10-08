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
