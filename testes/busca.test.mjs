import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { indiceDaBusca } from "../scripts/dados-navegador.mjs";
import { procurar } from "../src/js/busca-logica.js";

const I = indiceDaBusca(), nomes = (r) => r.map((e) => e[1]);

test("o índice cobre as duas edições e toda página citada existe depois do build", () => {
  assert.ok(I.length > 2400);
  for (const tipo of ["Ferramenta", "Jogo", "Região", "Bioma", "Pokémon", "Desafio", "Estrutura", "Item"]) assert.ok(I.some((e) => e[0] === tipo), tipo);
  if (!existsSync(new URL("../dist/index.html", import.meta.url))) return;      // sem build, a conferência das páginas fica para depois dele
  for (const [, nome, url] of I) assert.ok(existsSync(new URL(`../dist${url.split("#")[0]}index.html`, import.meta.url)), `${nome}: ${url}`);
});

test("quem começa pelo texto vem antes de quem só o contém", () => {
  const r = procurar(I, "char");
  assert.ok(r.length > 3);
  assert.ok(nomes(r).slice(0, 3).every((n) => n.toLowerCase().startsWith("char")), nomes(r).slice(0, 5).join(", "));
  const depois = nomes(r).findIndex((n) => !n.toLowerCase().startsWith("char"));
  if (depois >= 0) assert.ok(nomes(r).slice(depois).every((n) => !n.toLowerCase().startsWith("char")));
});

test("acentos e maiúsculas não importam, e número acha o Pokémon", () => {
  assert.ok(nomes(procurar(I, "AGUA", "cobblemon")).some((n) => n.includes("Água") || n.includes("água")));
  assert.equal(procurar(I, "flabebe")[0][1], "Flabébé");
  assert.deepEqual(procurar(I, "6").slice(0, 2).map((e) => e[1]), ["Charizard", "Charizard"]);
});

test("no empate, a edição em que a pessoa está vem primeiro", () => {
  assert.equal(procurar(I, "wooper", "cobblemon")[0][2], "/cobblemon/pokemon/wooper/");
  assert.equal(procurar(I, "wooper", "pokemon")[0][2], "/pokedex/wooper/");
});

test("texto vazio, só espaços ou sem resultado devolve lista vazia; o limite é respeitado", () => {
  assert.deepEqual(procurar(I, ""), []);
  assert.deepEqual(procurar(I, "   "), []);
  assert.deepEqual(procurar(I, "zzzzqqq"), []);
  assert.equal(procurar(I, "a", "pokemon", 10).length, 10);
  assert.ok(procurar(I, "<script>").length === 0);
});
