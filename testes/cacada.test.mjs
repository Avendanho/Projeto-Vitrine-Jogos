import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnsParaONavegador } from "../scripts/dados-navegador.mjs";
import { planejar, lerAlvos } from "../src/js/cacada-logica.js";

const { biomas, spawns, especies } = spawnsParaONavegador();
const existe = (n) => especies.some((e) => e[0] === n);
const semSpawn = especies.find((e) => !spawns[e[0]])[0];

test("os dados trazem as 888 espécies e regras só para quem nasce no mundo", () => {
  assert.equal(especies.length, 888);
  assert.ok(Object.keys(spawns).length < 888 && Object.keys(spawns).length > 700);
  for (const regras of Object.values(spawns)) for (const r of regras) assert.ok(r[0] >= 0 && r[0] <= 3 && r[1].every((b) => biomas[b]));
});

test("cada lugar lista só os alvos que nascem nele, e o resto fica em falta", () => {
  const { lugares, semLugar } = planejar([194, 6], spawns);
  assert.deepEqual(semLugar, []);
  assert.ok(lugares.length > 0);
  for (const lugar of lugares) {
    for (const a of lugar.acha) assert.ok(spawns[a.n].some((r) => r[1].includes(lugar.bioma)), `${a.n} não nasce em ${biomas[lugar.bioma]}`);
    assert.deepEqual([...lugar.acha.map((a) => a.n), ...lugar.falta].sort((x, y) => x - y), [6, 194]);
    for (const a of lugar.acha) assert.deepEqual(a.regras.map((r) => r[0]), [...a.regras.map((r) => r[0])].sort(), "da regra mais comum para a mais rara");
  }
  for (const n of [194, 6]) assert.ok(lugares.some((l) => l.acha.some((a) => a.n === n)), `${n} aparece em algum lugar`);
});

test("vêm primeiro os lugares com mais alvos", () => {
  const { lugares } = planejar([194, 60, 129, 54, 79], spawns);
  for (let i = 1; i < lugares.length; i++) assert.ok(lugares[i - 1].acha.length >= lugares[i].acha.length);
  assert.ok(lugares[0].acha.length >= 2, "cinco Pokémon de água doce dividem pelo menos um bioma");
});

test("quem não nasce no mundo vai para semLugar e falta em todos", () => {
  const { lugares, semLugar } = planejar([194, semSpawn], spawns);
  assert.deepEqual(semLugar, [semSpawn]);
  for (const lugar of lugares) assert.ok(lugar.falta.includes(semSpawn) || !lugar.acha.some((a) => a.n === semSpawn));
});

test("lista vazia, repetida ou com lixo", () => {
  assert.deepEqual(planejar([], spawns), { lugares: [], semLugar: [] });
  assert.deepEqual(planejar([194, 194, "194"], spawns).lugares[0].acha.length, 1);
  assert.deepEqual(planejar(["abc", -3, 1.5, null], spawns), { lugares: [], semLugar: [] });
  assert.deepEqual(lerAlvos("194,abc,6,194,99999,<b>", existe), [194, 6]);
  assert.deepEqual(lerAlvos(null, existe), []);
  assert.deepEqual(lerAlvos([194, "6"], existe), [194, 6]);
  assert.equal(lerAlvos(especies.map((e) => e[0]).join(","), existe).length, 24);
});
