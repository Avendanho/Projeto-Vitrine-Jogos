#!/usr/bin/env node
/* Traz do repositório público do Cobblemon (gitlab.com/cable-mc/cobblemon, licença MPL 2.0) as pastas
 * que os scripts de desenvolvimento do atlas leem, na versão que o atlas cobre, e as deixa em .mod/
 * com a mesma árvore do repositório. A pasta fica fora do Git do atlas: só o que os scripts geram é versionado.
 *
 *   node scripts/baixar-mod.mjs
 *
 * Usa o próprio git, com clone raso e esparso: vêm só a versão e as pastas pedidas. (O pacote por pasta
 * que o GitLab oferece é limitado a poucos pedidos por minuto e recusa o resto com erro 406.)
 * Depois: --fonte .mod (modelos), --ativos .mod/common/src/main/resources/assets/cobblemon (itens, maquetes),
 * --dados .mod/common/src/main/resources/data/cobblemon (maquetes, receitas).
 */
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), ".."), DESTINO = join(RAIZ, ".mod");
const VERSAO = "1.8.1", BASE = "common/src/main/resources";
const PASTAS = [
  "assets/cobblemon/bedrock/pokemon", "assets/cobblemon/textures/pokemon", "assets/cobblemon/textures/item", "assets/cobblemon/textures/block",
  "assets/cobblemon/models", "assets/cobblemon/blockstates", "assets/cobblemon/lang",
  "data/cobblemon/recipe", "data/cobblemon/structure", "data/cobblemon/worldgen"
];
const git = (args, onde = DESTINO) => {
  const r = spawnSync("git", args, { cwd: onde, stdio: "inherit" });
  if (r.status !== 0) { console.error(`git ${args.join(" ")} falhou`); process.exit(1); }
};
async function contar(pasta) {
  let n = 0;
  for (const e of await readdir(pasta, { withFileTypes: true })) n += e.isDirectory() ? await contar(join(pasta, e.name)) : 1;
  return n;
}

if (!existsSync(join(DESTINO, ".git"))) git(["clone", "--depth", "1", "--branch", VERSAO, "--filter=blob:none", "--sparse", "--quiet", "https://gitlab.com/cable-mc/cobblemon.git", DESTINO], RAIZ);
git(["sparse-checkout", "set", ...PASTAS.map((p) => `${BASE}/${p}`)]);
for (const pasta of PASTAS) {
  const local = join(DESTINO, BASE, pasta);
  console.log(existsSync(local) ? `${String(await contar(local)).padStart(5)} arquivos  ${pasta}` : `     faltou    ${pasta}`);
  if (!existsSync(local)) process.exitCode = 1;
}
