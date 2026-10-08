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

test("toda receita cabe na bancada e toda casa tem nome e figura", () => {
  const comReceita = COBBLEMON.itens.filter((i) => i.receita);
  assert.ok(comReceita.length >= 200);
  for (const item of comReceita) {
    const { grade, forma, ingredientes } = item.receita;
    assert.equal(grade.length, 9, item.id);
    assert.ok(["grade", "livre"].includes(forma) && ingredientes.length > 0, item.id);
    for (const casa of grade.filter(Boolean)) {
      const [id, nome] = casa, [espaco, curto] = id.split(":");
      assert.ok(typeof nome === "string" && nome.length > 1, `${item.id}: casa sem nome`);
      assert.ok((espaco === "cobblemon" && (curto in ITENS_ARTE.itens || ITENS_ARTE.blocos.includes(curto))) || id in ITENS_ARTE.ingredientes, `${item.id}: ${id} sem figura`);
    }
  }
  const pc = COBBLEMON.itens.find((i) => i.id === "pc").receita;
  assert.ok(pc.ingredientes.includes("Lingote de Ferro"), "o PC leva ferro: as etiquetas de convenção são resolvidas");
});

test("as receitas das outras estações também têm nome e figura em toda casa", () => {
  const comOutras = COBBLEMON.itens.filter((i) => i.outras);
  assert.ok(comOutras.length >= 100, `${comOutras.length} itens`);
  const estacoes = new Set();
  for (const item of comOutras) for (const o of item.outras) {
    estacoes.add(o.estacao);
    const casas = (o.grade ?? o.entradas).filter(Boolean);
    assert.ok(casas.length > 0 && typeof o.estacao === "string" && o.estacao.length > 3, item.id);
    if (o.grade) assert.equal(o.grade.length, 9, item.id);
    for (const [id, nome] of casas) {
      const [espaco, curto] = id.split(":");
      assert.ok(nome.length > 1, `${item.id}: casa sem nome`);
      assert.ok((espaco === "cobblemon" && (curto in ITENS_ARTE.itens || ITENS_ARTE.blocos.includes(curto))) || id in ITENS_ARTE.ingredientes, `${item.id}: ${id} sem figura`);
    }
  }
  assert.ok([...estacoes].some((e) => e.includes("Panela")) && [...estacoes].some((e) => e.includes("Poções")) && [...estacoes].some((e) => e.includes("Fornalha")));
  const semNada = COBBLEMON.itens.filter((i) => !i.receita && !i.outras).length;
  assert.ok(semNada < 200, `${semNada} itens continuam sem receita: são os que só se acham, não se fabricam`);
});

test("toda baga vem de pé silvestre ou de mutação, e os pares citam bagas que existem", () => {
  const bagas = COBBLEMON.itens.filter((i) => i.grupo === "bagas"), ids = new Set(bagas.map((b) => b.id));
  assert.equal(bagas.length, 70);
  for (const b of bagas) {
    assert.ok(b.silvestre || b.cruzas?.length, `${b.id} sem origem`);
    for (const par of b.cruzas ?? []) {
      assert.equal(par.length, 2);
      assert.ok(ids.has(par[0]) && ids.has(par[1]) && par[0] !== par[1] && !par.includes(b.id), `${b.id}: par ${par}`);
    }
    assert.equal(new Set((b.cruzas ?? []).map((p) => p.join("+"))).size, (b.cruzas ?? []).length, `${b.id}: par repetido`);
  }
  const lum = bagas.find((b) => b.id === "lum_berry");
  assert.ok(lum.cruzas.some((p) => p.join("+") === "cheri_berry+oran_berry"), "Cheri com Oran dá Lum");
  assert.equal(bagas.reduce((n, b) => n + (b.cruzas?.length ?? 0), 0), 77);
});
