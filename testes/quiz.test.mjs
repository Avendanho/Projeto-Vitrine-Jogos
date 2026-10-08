import { test } from "node:test";
import assert from "node:assert/strict";
import { especiesParaONavegador } from "../scripts/dados-navegador.mjs";
import { especie, porSlug } from "../src/js/especies-logica.js";
import { diaDoQuiz, alvoDoDia, comparar, novaSequencia, sequenciaViva, resultadoEmTexto, PRIMEIRO_DIA, MODOS } from "../src/js/quiz-logica.js";

const L = especiesParaONavegador(), de = (slug) => especie(porSlug(L, slug));
const estados = (pistas) => Object.fromEntries(pistas.map((p) => [p.campo, p.seta ?? p.estado]));

test("o dia vira à meia-noite de Brasília, que é 3h em UTC", () => {
  assert.equal(diaDoQuiz(Date.UTC(2026, 9, 8, 15)), PRIMEIRO_DIA);
  assert.equal(diaDoQuiz(Date.UTC(2026, 9, 9, 2, 59)), PRIMEIRO_DIA);
  assert.equal(diaDoQuiz(Date.UTC(2026, 9, 9, 3, 0)), PRIMEIRO_DIA + 1);
});

test("em 1025 dias seguidos nenhum Pokémon se repete, e cada modo tem a sua ordem", () => {
  for (const modo of MODOS) {
    const vistos = new Set();
    for (let d = 0; d < L.length; d++) vistos.add(alvoDoDia(PRIMEIRO_DIA + d, modo, L.length));
    assert.equal(vistos.size, L.length, modo);
  }
  const iguais = Array.from({ length: 60 }, (_, d) => alvoDoDia(PRIMEIRO_DIA + d, "ficha", L.length) === alvoDoDia(PRIMEIRO_DIA + d, "gravura", L.length)).filter(Boolean).length;
  assert.ok(iguais < 5, "os dois enigmas do dia quase nunca coincidem");
  assert.equal(alvoDoDia(PRIMEIRO_DIA, "ficha", L.length), alvoDoDia(PRIMEIRO_DIA, "ficha", L.length), "o mesmo dia dá sempre o mesmo Pokémon");
  assert.ok(alvoDoDia(-5, "ficha", L.length) >= 0, "dia negativo não sai da lista");
});

test("o palpite revela o que bate, o que bate fora do lugar e para que lado ir", () => {
  assert.deepEqual(estados(comparar(de("charmander"), de("charizard"))), { tipo1: "certo", tipo2: "errado", geracao: "certo", cor: "certo", estagio: "mais", altura: "mais", peso: "mais" });
  // Pidgey é Normal/Voador: contra Charizard (Fogo/Voador) o Voador está certo no segundo tipo
  assert.equal(estados(comparar(de("pidgey"), de("charizard"))).tipo2, "certo");
  // Zubat é Venenoso/Voador; contra Tornadus (só Voador) o Voador existe, mas em outro lugar
  assert.equal(estados(comparar(de("zubat"), de("tornadus"))).tipo2, "parcial");
  // dois Pokémon de um tipo só: a falta do segundo tipo conta como acerto
  assert.equal(estados(comparar(de("pikachu"), de("raichu"))).tipo2, "certo");
  assert.ok(comparar(de("mew"), de("mew")).every((p) => p.estado === "certo" && p.seta === null));
});

test("a sequência cresce de um dia para o outro e zera se pular um", () => {
  let s = novaSequencia(null, 100);
  assert.deepEqual(s, { dia: 100, n: 1 });
  assert.deepEqual(novaSequencia(s, 100), s, "acertar o segundo enigma do mesmo dia não conta de novo");
  s = novaSequencia(s, 101);
  assert.equal(s.n, 2);
  assert.equal(sequenciaViva(s, 102), 2, "ontem ainda vale hoje");
  assert.equal(sequenciaViva(s, 103), 0);
  assert.equal(novaSequencia(s, 103).n, 1);
});

test("o resultado para copiar não traz o nome de ninguém", () => {
  const texto = resultadoEmTexto([comparar(de("charmander"), de("charizard")), comparar(de("charizard"), de("charizard"))], PRIMEIRO_DIA, "ficha", true);
  assert.match(texto, /^PokéAtlas, quiz nº 1 \(ficha\): 2\/8\n/);
  assert.ok(!/char/i.test(texto));
  assert.equal(resultadoEmTexto([false, false, true], PRIMEIRO_DIA + 1, "gravura", true).split("\n")[1], "⬜⬜🟩");
});
