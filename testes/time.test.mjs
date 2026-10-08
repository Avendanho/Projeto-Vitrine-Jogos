import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { multiplicador, analisar, escrito } from "../src/js/time-logica.js";

const { tipos, tabela } = JSON.parse(readFileSync(new URL("../dados/tipos.json", import.meta.url), "utf8"));
const m = (atacante, ...defensor) => multiplicador(tabela, tipos, atacante, defensor);

test("a tabela baixada tem 18 tipos e os fatores conhecidos", () => {
  assert.equal(tipos.length, 18);
  assert.ok(tabela.every((linha) => linha.length === 18 && linha.every((f) => [0, 0.5, 1, 2].includes(f))));
  assert.equal(m("Água", "Fogo"), 2);
  assert.equal(m("Fogo", "Água"), 0.5);
  assert.equal(m("Elétrico", "Terrestre"), 0);
  assert.equal(m("Normal", "Fantasma"), 0);
  assert.equal(m("Dragão", "Fada"), 0);
});

test("dois tipos multiplicam os fatores", () => {
  assert.equal(m("Gelo", "Dragão", "Voador"), 4);
  assert.equal(m("Pedra", "Fogo", "Voador"), 4);
  assert.equal(m("Planta", "Fogo", "Voador"), 0.25);
  assert.equal(m("Terrestre", "Fogo", "Voador"), 0, "a imunidade do Voador anula a fraqueza do Fogo");
  assert.equal(m("Tipo que não existe", "Fogo"), 1);
});

test("a análise do time conta fraquezas, acha buracos e o que fica sem resposta", () => {
  const charizard = { tipos: ["Fogo", "Voador"] }, moltres = { tipos: ["Fogo", "Voador"] }, blastoise = { tipos: ["Água"] };
  const so = analisar(tabela, tipos, [charizard]);
  assert.deepEqual(so.porTipo.find((t) => t.tipo === "Pedra").fatores, [4]);
  assert.deepEqual(so.buracos, [], "com um só Pokémon não há buraco: é preciso dois fracos");
  const dois = analisar(tabela, tipos, [charizard, moltres]);
  assert.ok(dois.buracos.includes("Pedra") && dois.buracos.includes("Água") && dois.buracos.includes("Elétrico"));
  const tres = analisar(tabela, tipos, [charizard, moltres, blastoise]);
  assert.ok(!tres.buracos.includes("Água"), "Blastoise resiste a Água e fecha o buraco");
  assert.ok(tres.cobertos.includes("Planta") && tres.cobertos.includes("Fogo"));
  assert.ok(tres.semResposta.includes("Dragão"));
  assert.equal(tres.cobertos.length + tres.semResposta.length, 18);
  const vazio = analisar(tabela, tipos, []);
  assert.deepEqual([vazio.buracos, vazio.cobertos, vazio.semResposta], [[], [], []]);
  assert.equal(vazio.porTipo.length, 18);
});

test("o fator escrito na tabela", () => {
  assert.deepEqual([0, 0.25, 0.5, 1, 2, 4].map(escrito), ["0", "¼", "½", "", "2", "4"]);
});
