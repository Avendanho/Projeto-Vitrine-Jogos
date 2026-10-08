import { test } from "node:test";
import assert from "node:assert/strict";
import { especiesParaONavegador } from "../scripts/dados-navegador.mjs";
import * as D from "../src/js/diario-logica.js";

const L = especiesParaONavegador(), familiaDe = (id) => L.find((l) => l[0] === id)?.[10] ?? id;
const nova = () => D.novaCampanha({ nome: "  Os Super Woopers ", jogo: "heartgold-soulsilver", regras: "Só Woopers." }, 1000);

test("uma campanha nova nasce vazia, com o nome limpo", () => {
  const c = nova();
  assert.deepEqual([c.nome, c.jogo, c.insignias, c.capturas.length], ["Os Super Woopers", "heartgold-soulsilver", 0, 0]);
  assert.equal(D.novaCampanha({ nome: "   " }).nome, "Campanha sem nome");
  assert.notEqual(D.novaCampanha({}, 5).id, D.novaCampanha({}, 5).id, "duas campanhas criadas no mesmo instante não dividem o id");
});

test("registrar, pôr no time e derrubar não mexem na campanha original", () => {
  const c0 = nova(), c1 = D.registrar(c0, { local: "Rota 32", especie: 194, apelido: "Lama" });
  assert.equal(c0.capturas.length, 0);
  const id = c1.capturas[0].id;
  const { campanha: c2, erro } = D.alternarTime(c1, id);
  assert.equal(erro, null);
  assert.equal(c2.capturas[0].time, true);
  const c3 = D.marcarQueda(c2, id, "Whitney, Miltank");
  assert.deepEqual([c3.capturas[0].estado, c3.capturas[0].time, c3.capturas[0].nota], ["caiu", false, "Whitney, Miltank"]);
  assert.match(D.alternarTime(c3, id).erro, /vivo/);
  assert.equal(D.reviver(c3, id).capturas[0].estado, "vivo");
  assert.equal(D.remover(c3, id).capturas.length, 0);
});

test("o time tem seis vagas", () => {
  let c = nova();
  for (let i = 0; i < 7; i++) c = D.registrar(c, { local: `Rota ${i}`, especie: 194 });
  for (const x of c.capturas.slice(0, 6)) c = D.alternarTime(c, x.id).campanha;
  const setimo = D.alternarTime(c, c.capturas[6].id);
  assert.match(setimo.erro, /seis/);
  assert.equal(setimo.campanha.capturas.filter((x) => x.time).length, 6);
});

test("a família repetida é acusada, na forma básica ou evoluída", () => {
  const c = D.registrar(nova(), { local: "Rota 1", especie: 4 });
  assert.equal(D.repetida(c, 5, familiaDe)?.especie, 4, "Charmeleon depois de Charmander");
  assert.equal(D.repetida(c, 6, familiaDe)?.especie, 4);
  assert.equal(D.repetida(c, 7, familiaDe), null);
  assert.equal(D.noLocal(c, "Rota 1").length, 1);
});

test("as insígnias ficam entre zero e oito", () => {
  assert.deepEqual([-3, 4, 99, "x"].map((n) => D.comInsignias(nova(), n).insignias), [0, 4, 8, 0]);
});

test("exportar e importar devolve o mesmo diário", () => {
  let c = D.registrar(nova(), { local: "Rota 32", especie: 194, apelido: "Lama" });
  c = D.marcarQueda(c, c.capturas[0].id, "caiu lutando");
  assert.deepEqual(D.importar(D.exportar([c])).campanhas, [c]);
});

test("arquivo estragado é recusado com mensagem, sem lançar erro", () => {
  for (const lixo of ["lixo", "", "{}", "[]", "null", '{"atlas":"outro","campanhas":[]}', '{"atlas":"pokeatlas-diario","campanhas":"x"}', '{"atlas":"pokeatlas-diario","campanhas":[]}']) {
    const r = D.importar(lixo);
    assert.ok(typeof r.erro === "string" && r.erro.length > 10 && !r.campanhas, lixo);
  }
});

test("o que vem de fora é saneado: campos estranhos, espécie inválida, textos enormes", () => {
  const sujo = JSON.stringify({ atlas: D.MARCA, campanhas: [{ nome: "x".repeat(500), insignias: 40, capturas: [{ especie: "abc" }, { especie: 25, estado: "caiu", time: true, apelido: "<b>Zap</b>".repeat(20) }, null] }, "isto não é campanha"] });
  const { campanhas } = D.importar(sujo);
  assert.equal(campanhas.length, 1);
  assert.equal(campanhas[0].nome.length, 80);
  assert.equal(campanhas[0].insignias, 8);
  assert.equal(campanhas[0].capturas.length, 1);
  assert.deepEqual([campanhas[0].capturas[0].time, campanhas[0].capturas[0].apelido.length <= 24], [false, true], "quem caiu não fica no time");
});

test("juntar substitui a campanha de mesmo id e mantém as outras", () => {
  const a = nova(), b = D.novaCampanha({ nome: "Outra" }, 2000), a2 = { ...a, nome: "Renomeada" };
  assert.deepEqual(D.juntar([a, b], [a2]).map((c) => c.nome), ["Outra", "Renomeada"]);
});
