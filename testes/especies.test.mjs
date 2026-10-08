import { test } from "node:test";
import assert from "node:assert/strict";
import { especiesParaONavegador } from "../scripts/dados-navegador.mjs";
import { especie, porSlug, porNome, procurarEspecie, lerLista } from "../src/js/especies-logica.js";

const L = especiesParaONavegador();

test("a lista traz as 1025 espécies, com estágio e família", () => {
  assert.equal(L.length, 1025);
  const charizard = especie(porSlug(L, "charizard"));
  assert.deepEqual([charizard.id, charizard.estagio, charizard.familia], [6, 3, 4]);
  assert.equal(charizard.atributos.length, 6);
  assert.equal(especie(porSlug(L, "eevee")).estagio, 1);
  for (const l of L) assert.ok(l[9] >= 1 && l[9] <= 3 && l[3].length >= 1, l[2]);
});

test("procurar aceita nome sem acento, pedaço de nome e número", () => {
  assert.equal(procurarEspecie(L, "6")[0][2], "Charizard");
  assert.equal(procurarEspecie(L, "CHAR")[0][2].startsWith("Char"), true);
  assert.equal(procurarEspecie(L, "flabebe")[0][2], "Flabébé");
  assert.deepEqual(procurarEspecie(L, ""), []);
  assert.deepEqual(procurarEspecie(L, "99999"), []);
  assert.equal(porNome(L, " pikachu ")[0], 25);
  assert.equal(porNome(L, "pika"), null);
});

test("a lista do endereço ignora o que não existe, não repete e respeita o limite", () => {
  assert.deepEqual(lerLista("charizard,naoexiste,blastoise", L).map((l) => l[0]), [6, 9]);
  assert.deepEqual(lerLista("6,6,charizard,25", L).map((l) => l[0]), [6, 25]);
  assert.deepEqual(lerLista("1,2,3,4,5,6,7,8", L, 6).length, 6);
  assert.deepEqual(lerLista(null, L), []);
  assert.deepEqual(lerLista("<script>,,;drop", L), []);
});
