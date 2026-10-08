#!/usr/bin/env node
/* Traz o grito de cada espécie do repositório público PokeAPI/cries (os mesmos arquivos que a PokéAPI
 * aponta no campo "cries") e os deixa em src/gritos/<número>.ogg, um por espécie da Pokédex nacional.
 * Só roda em desenvolvimento: o que ele baixa é versionado, e o build só copia a pasta.
 *
 *   node scripts/gritos.mjs
 *
 * Usa o próprio git, com clone raso e esparso: vem só a pasta dos gritos atuais. A pasta de trabalho
 * (.gritos/) fica fora do Git do atlas e pode ser apagada depois.
 */
import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { POKEDEX } from "./base.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), ".."), TRABALHO = join(RAIZ, ".gritos"), DESTINO = join(RAIZ, "src", "gritos");
const PASTA = "cries/pokemon/latest";
const git = (args, onde) => {
  const r = spawnSync("git", args, { cwd: onde, stdio: "inherit" });
  if (r.status !== 0) { console.error(`git ${args.join(" ")} falhou`); process.exit(1); }
};

if (!existsSync(join(TRABALHO, ".git"))) git(["clone", "--depth", "1", "--filter=blob:none", "--sparse", "--quiet", "https://github.com/PokeAPI/cries.git", TRABALHO], RAIZ);
git(["sparse-checkout", "set", PASTA], TRABALHO);

await mkdir(DESTINO, { recursive: true });
const faltam = [];
let bytes = 0;
for (const id of Object.keys(POKEDEX.especies)) {
  const origem = join(TRABALHO, PASTA, `${id}.ogg`);
  if (!existsSync(origem)) { faltam.push(id); continue; }
  await copyFile(origem, join(DESTINO, `${id}.ogg`));
  bytes += (await stat(origem)).size;
}
console.log(`${(await readdir(DESTINO)).length} gritos em src/gritos (${(bytes / 1e6).toFixed(1)} MB)`);
if (faltam.length) { console.error(`sem grito: ${faltam.join(", ")}`); process.exitCode = 1; }
