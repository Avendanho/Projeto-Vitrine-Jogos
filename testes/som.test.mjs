import { test } from "node:test";
import assert from "node:assert/strict";
import { frequencia, MUSICAS, partitura } from "../src/js/som-logica.js";

test("a frequência das notas escritas", () => {
  assert.equal(frequencia("A4"), 440);
  assert.equal(Math.round(frequencia("C4") * 100) / 100, 261.63);
  assert.equal(frequencia("A5"), 880);
  assert.equal(Math.round(frequencia("F#4") * 100) / 100, 369.99);
  assert.equal(frequencia("Gb4"), frequencia("F#4"));
  for (const lixo of ["", "-", "_", "x", "H4", "C", "C10"]) assert.equal(frequencia(lixo), null, lixo);
});

test("cada música tem vozes do mesmo tamanho, em compassos inteiros, e só notas que existem", () => {
  for (const [nome, musica] of Object.entries(MUSICAS)) {
    const tamanhos = musica.vozes.map((v) => v.notas.split(/\s+/).filter((t) => t && t !== "|").length);
    assert.equal(new Set(tamanhos).size, 1, `${nome}: vozes de tamanhos diferentes (${tamanhos})`);
    assert.equal(tamanhos[0] % 8, 0, `${nome}: compasso incompleto`);
    for (const voz of musica.vozes) for (const compasso of voz.notas.split("|")) assert.equal(compasso.trim().split(/\s+/).length, 8, `${nome}: compasso "${compasso.trim()}"`);
    const p = partitura(musica);
    assert.equal(p.passos, tamanhos[0]);
    assert.ok(p.eventos.length > 20, nome);
    for (const e of p.eventos) {
      const voz = musica.vozes[e.voz];
      if (voz.onda === "ruido") assert.equal(e.freq, null);
      else assert.ok(e.freq > 60 && e.freq < 2200, `${nome}: nota fora do alcance no passo ${e.passo}`);
      assert.ok(e.passos >= 1 && e.passo + e.passos <= p.passos, `${nome}: nota que passa do fim`);
    }
  }
});

test("a nota sustentada conta os passos em que continua", () => {
  const p = partitura({ bpm: 120, vozes: [{ onda: "sine", notas: "C4 _ _ - E4 - G4 _" }] });
  assert.equal(p.duracao, 0.25);
  assert.deepEqual(p.eventos.map((e) => [e.passo, e.passos]), [[0, 3], [4, 1], [6, 2]]);
});
