/* O que o build carrega de dados/: o atlas só mostra o que o Cobblemon traz na versão coberta. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { COBBLEMON, ITENS_ARTE, MAQUETES, MODELOS } from "../scripts/base.mjs";

test("só entram itens e estruturas que existem na versão do mod", () => {
  assert.equal(COBBLEMON.itens.length, 490);
  assert.equal(COBBLEMON.estruturas.length, 65);
  for (const item of COBBLEMON.itens) assert.ok(item.id in ITENS_ARTE.itens || ITENS_ARTE.blocos.includes(item.id), `${item.id} sem arte`);
  for (const estrutura of COBBLEMON.estruturas) assert.ok(MAQUETES.estruturas[estrutura.id], `${estrutura.id} sem maquete`);
});

test("toda espécie implementada tem modelo desenhado", () => {
  const noMod = Object.values(COBBLEMON.especies).filter((e) => e.impl);
  assert.equal(noMod.length, 888);
  for (const e of noMod) assert.ok(MODELOS.has(e.n), `${e.nome} sem modelo`);
});

test("quem deixa cair: o avesso das quedas de cada espécie", async () => {
  const { quemDeixa } = await import("../scripts/paginas-cobblemon.mjs");
  const mapa = quemDeixa();
  assert.ok(mapa.get("Pó de Blaze").includes(6), "Charizard deixa Pó de Blaze");
  for (const [nome, especies] of mapa) {
    assert.ok(especies.length > 0, nome);
    for (const n of especies) assert.ok(COBBLEMON.especies[n].drops.some(([item]) => item === nome), `${n} não deixa ${nome}`);
  }
});
