#!/usr/bin/env node
/* Baixa do repositório público do Cobblemon (gitlab.com/cable-mc/cobblemon, licença MPL 2.0) as pastas
 * que os scripts de desenvolvimento do atlas leem, na versão que o atlas cobre, e as deixa em .mod/
 * com a mesma árvore do repositório. A pasta fica fora do Git: só o que os scripts geram é versionado.
 *
 *   node scripts/baixar-mod.mjs            baixa o que faltar
 *   node scripts/baixar-mod.mjs --tudo     baixa de novo mesmo o que já existe
 *
 * Depois: --fonte .mod (modelos), --ativos .mod/common/src/main/resources/assets/cobblemon (itens, maquetes),
 * --dados .mod/common/src/main/resources/data/cobblemon (maquetes, receitas).
 * Precisa do comando tar (vem no Linux, no macOS e no Windows 10 em diante).
 */
import { mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), ".."), DESTINO = join(RAIZ, ".mod");
const VERSAO = "1.8.1", BASE = "common/src/main/resources";
const PASTAS = [
  "assets/cobblemon/bedrock/pokemon/models", "assets/cobblemon/bedrock/pokemon/resolvers", "assets/cobblemon/bedrock/pokemon/posers",
  "assets/cobblemon/bedrock/pokemon/animations", "assets/cobblemon/textures/pokemon", "assets/cobblemon/textures/item",
  "assets/cobblemon/textures/block", "assets/cobblemon/models", "assets/cobblemon/blockstates",
  "data/cobblemon/recipe", "data/cobblemon/structure", "data/cobblemon/worldgen"
];
const tudo = process.argv.includes("--tudo");

async function contar(pasta) {
  let n = 0;
  for (const e of await readdir(pasta, { withFileTypes: true })) n += e.isDirectory() ? await contar(join(pasta, e.name)) : 1;
  return n;
}

await mkdir(DESTINO, { recursive: true });
for (const pasta of PASTAS) {
  const caminho = `${BASE}/${pasta}`, local = join(DESTINO, caminho);
  if (existsSync(local) && !tudo) { console.log(`já existe  ${pasta} (${await contar(local)} arquivos)`); continue; }
  // o GitLab só entrega uns poucos pacotes por minuto para o mesmo endereço: quando recusa (406 ou 429), espera e tenta de novo
  let resposta = null;
  for (let tentativa = 0; tentativa < 8; tentativa++) {
    resposta = await fetch(`https://gitlab.com/api/v4/projects/cable-mc%2Fcobblemon/repository/archive.tar.gz?sha=${VERSAO}&path=${encodeURIComponent(caminho)}`);
    if (resposta.ok || ![406, 429, 503].includes(resposta.status)) break;
    await new Promise((r) => setTimeout(r, 20000));
  }
  if (!resposta.ok) { console.error(`falhou     ${pasta}: ${resposta.status}`); process.exitCode = 1; continue; }
  const pacote = join(DESTINO, "pacote.tar.gz");
  await writeFile(pacote, Buffer.from(await resposta.arrayBuffer()));
  await rm(local, { recursive: true, force: true });
  // o pacote vem com uma pasta de topo com o nome da versão; ela sai, e fica a árvore do repositório
  const tar = spawnSync("tar", ["-xzf", pacote, "-C", DESTINO, "--strip-components=1"], { stdio: "inherit" });
  await rm(pacote, { force: true });
  if (tar.status !== 0 || !existsSync(local)) { console.error(`falhou     ${pasta}: não foi possível descompactar`); process.exitCode = 1; continue; }
  console.log(`baixada    ${pasta} (${await contar(local)} arquivos)`);
}
