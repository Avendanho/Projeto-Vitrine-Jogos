#!/usr/bin/env node
/* Traz do repositório público do Cobblemon (gitlab.com/cable-mc/cobblemon, licença MPL 2.0) as pastas
 * que os scripts de desenvolvimento do atlas leem, na versão que o atlas cobre, e as deixa em .mod/
 * com a mesma árvore do repositório. A pasta fica fora do Git do atlas: só o que os scripts geram é versionado.
 *
 *   node scripts/baixar-mod.mjs               só o Cobblemon
 *   node scripts/baixar-mod.mjs --minecraft   também as texturas, os modelos e as etiquetas do Minecraft 1.21.1,
 *                                             do pacote oficial da Mojang, em .mod/minecraft/ (usados para tirar a
 *                                             cor média dos blocos e a silhueta dos ingredientes; não são versionados)
 *
 * Usa o próprio git, com clone raso e esparso: vêm só a versão e as pastas pedidas. (O pacote por pasta
 * que o GitLab oferece é limitado a poucos pedidos por minuto e recusa o resto com erro 406.)
 * Depois: --fonte .mod (dados e modelos), --ativos .mod/common/src/main/resources/assets/cobblemon (itens, maquetes),
 * --dados .mod/common/src/main/resources/data/cobblemon (maquetes), --minecraft .mod/minecraft/assets/minecraft.
 */
import { readdir, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), ".."), DESTINO = join(RAIZ, ".mod");
const VERSAO = "1.8.1", BASE = "common/src/main/resources";
const PASTAS = [
  "assets/cobblemon/bedrock/pokemon", "assets/cobblemon/textures/pokemon", "assets/cobblemon/textures/item", "assets/cobblemon/textures/block",
  "assets/cobblemon/models", "assets/cobblemon/blockstates", "assets/cobblemon/lang", "data/cobblemon"
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

/* O pacote do jogo vem do servidor oficial da Mojang: o manifesto de versões aponta para o arquivo de cada uma. */
if (process.argv.includes("--minecraft")) {
  const VERSAO_DO_JOGO = "1.21.1", destino = join(DESTINO, "minecraft");
  if (existsSync(join(destino, "assets", "minecraft", "textures", "item"))) console.log(`já existe  minecraft ${VERSAO_DO_JOGO} (${await contar(destino)} arquivos)`);
  else {
    const manifesto = await (await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json")).json();
    const versao = await (await fetch(manifesto.versions.find((v) => v.id === VERSAO_DO_JOGO).url)).json();
    await mkdir(destino, { recursive: true });
    const pacote = join(destino, "client.jar");
    await writeFile(pacote, Buffer.from(await (await fetch(versao.downloads.client.url)).arrayBuffer()));
    const pastas = ["assets/minecraft/textures/item/*", "assets/minecraft/textures/block/*", "assets/minecraft/models/*", "assets/minecraft/blockstates/*", "data/minecraft/tags/item/*"];
    // o pacote é um zip: unzip onde existe, tar (bsdtar) no Windows
    const abrir = spawnSync("unzip", ["-q", "-o", pacote, ...pastas, "-d", destino], { stdio: "inherit" });
    if (abrir.status !== 0) spawnSync("tar", ["-xf", pacote, "-C", destino, ...pastas.map((p) => p.replace("/*", ""))], { stdio: "inherit" });
    await rm(pacote, { force: true });
    console.log(existsSync(join(destino, "assets")) ? `${String(await contar(destino)).padStart(5)} arquivos  minecraft ${VERSAO_DO_JOGO}` : "     faltou    minecraft");
  }
}
