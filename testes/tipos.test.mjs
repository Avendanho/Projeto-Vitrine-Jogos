import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { relacoes, lugarNaRoda, trecho } from "../src/js/tipos-logica.js";
import { alcance, notaDoAlcance, encaixe } from "../src/js/hexagono.js";

const { tipos, tabela } = JSON.parse(readFileSync(new URL("../dados/tipos.json", import.meta.url), "utf8"));
const de = (tipo) => relacoes(tabela, tipos, tipo), ordenado = (l) => [...l].sort();

test("as relações de um tipo, atacando e defendendo", () => {
  const fogo = de("Fogo");
  assert.deepEqual(ordenado(fogo.atinge), ordenado(["Planta", "Gelo", "Inseto", "Aço"]));
  assert.deepEqual(ordenado(fogo.apanha), ordenado(["Água", "Terrestre", "Pedra"]));
  assert.ok(fogo.poucoEfeito.includes("Água") && fogo.poucoEfeito.includes("Dragão") && fogo.resiste.includes("Fada"));
  assert.deepEqual([fogo.naoAfeta, fogo.imune], [[], []]);
  assert.deepEqual(de("Normal").imune, ["Fantasma"]);
  assert.deepEqual(de("Normal").naoAfeta, ["Fantasma"]);
  assert.deepEqual(de("Normal").atinge, [], "Normal não atinge ninguém em dobro");
  assert.ok(de("Dragão").atinge.includes("Dragão") && de("Dragão").apanha.includes("Dragão"), "um tipo pode bater em si mesmo");
  assert.equal(de("Tipo que não existe"), null);
});

test("a roda é simétrica: se A atinge B em dobro, B apanha de A", () => {
  for (const a of tipos) for (const b of de(a).atinge) assert.ok(de(b).apanha.includes(a), `${a} → ${b}`);
  for (const a of tipos) for (const b of de(a).naoAfeta) assert.ok(de(b).imune.includes(a), `${a} → ${b}`);
});

test("os lugares na roda e o trecho entre dois deles", () => {
  const alto = lugarNaRoda(0, 18), direita = lugarNaRoda(4.5, 18);
  assert.deepEqual([Math.round(alto.x), Math.round(alto.y)], [50, 6]);
  assert.deepEqual([Math.round(direita.x), Math.round(direita.y)], [94, 50]);
  const t = trecho({ x: 0, y: 0 }, { x: 100, y: 0 }, 10);
  assert.deepEqual([t.x1, t.y1, t.x2, t.y2], [10, 0, 90, 0]);
});

test("arrastar um vértice: a distância vira nota, e a nota volta à mesma distância", () => {
  for (const nota of [0, 1, 2.5, 4, 5]) assert.ok(Math.abs(notaDoAlcance(alcance(nota)) - nota) < 1e-9, String(nota));
  assert.equal(notaDoAlcance(0), 0, "o centro é zero, não negativo");
  assert.equal(notaDoAlcance(1.4), 5, "puxar para fora do hexágono para em cinco");
  // quanto mais o perfil desenhado se parece com o de um jogo, maior o encaixe
  const jogo = [5, 5, 5, 2, 4, 1];
  assert.ok(encaixe(jogo, jogo) > encaixe([4, 5, 4, 2, 3, 2], jogo) && encaixe([4, 5, 4, 2, 3, 2], jogo) > encaixe([1, 1, 1, 5, 2, 5], jogo));
});
