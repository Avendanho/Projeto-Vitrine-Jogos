import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { facesDoExportado } from "../src/js/modelo-malha.js";
import { medidas, desenharModelo } from "../src/js/modelo-desenho.js";

const ler = (n) => JSON.parse(readFileSync(new URL(`../src/modelos3d/${n}.json`, import.meta.url), "utf8"));
const lista = JSON.parse(readFileSync(new URL("../dados/modelos3d.json", import.meta.url), "utf8"));
const branca = { data: new Uint8ClampedArray(4 * 4 * 4).fill(255), width: 4, height: 4 };
const pintados = (cor) => { let n = 0; for (let i = 3; i < cor.length; i += 4) if (cor[i] > 0) n++; return n; };
const desenhar = (faces, guinada, textura = branca, lado = 96) => desenharModelo(new Uint8ClampedArray(lado * lado * 4), lado, faces, textura, medidas(faces), guinada, 0.24);

test("todas as 888 espécies têm modelo e textura para o visor, e as com shiny têm a textura dela", () => {
  assert.equal(lista.modelos.length, 888);
  for (const n of lista.modelos) for (const arquivo of [`${n}.json`, `${n}.png`]) assert.ok(existsSync(new URL(`../src/modelos3d/${arquivo}`, import.meta.url)), arquivo);
  assert.ok(lista.shiny.length > 800);
  for (const n of lista.shiny) assert.ok(existsSync(new URL(`../src/modelos3d/${n}-shiny.png`, import.meta.url)), `${n}-shiny.png`);
});

test("o arquivo exportado vira faces: no máximo seis por cubo, com quatro cantos e textura", () => {
  const modelo = ler(6), faces = facesDoExportado(modelo);
  assert.ok(faces.length > 100 && faces.length <= modelo.c.length * 6, `${faces.length} faces para ${modelo.c.length} cubos`);
  for (const f of faces) {
    assert.equal(f.pontos.length, 4);
    assert.ok(f.pontos.flat().every(Number.isFinite) && f.normal.every(Number.isFinite));
    assert.ok(f.uvs.flat().every((v) => v >= -0.01 && v <= 1.01), "a textura fica dentro da imagem");
  }
});

test("o desenhista de software pinta o modelo, e girar muda o desenho", () => {
  const faces = facesDoExportado(ler(6));
  const frente = desenhar(faces, -0.56), costas = desenhar(faces, -0.56 + Math.PI);
  assert.ok(pintados(frente) > 96 * 96 * 0.12, `${pintados(frente)} pontos pintados`);
  assert.notDeepEqual(frente, costas);
  assert.deepEqual(desenhar(faces, -0.56), frente, "o mesmo ângulo dá o mesmo desenho");
});

test("ponto translúcido na textura sai translúcido no desenho; ponto vazio não pinta nada", () => {
  const faces = facesDoExportado(ler(25));
  const vidro = { data: new Uint8ClampedArray(16).fill(128), width: 2, height: 2 }, vazia = { data: new Uint8ClampedArray(16), width: 2, height: 2 };
  const cor = desenhar(faces, -0.56, vidro);
  assert.ok(pintados(cor) > 500);
  // onde várias camadas se sobrepõem a soma chega perto do opaco; na borda, com uma camada só, fica à mostra
  let meios = 0;
  for (let i = 3; i < cor.length; i += 4) if (cor[i] > 0 && cor[i] < 250) meios++;
  assert.ok(meios > 50, `${meios} pontos translúcidos`);
  assert.equal(pintados(desenhar(faces, -0.56, vazia)), 0);
});

test("modelo sem faces e escala nula não quebram", () => {
  assert.deepEqual(medidas([]).raio, 1);
  assert.equal(pintados(desenhar([], 0)), 0);
});
