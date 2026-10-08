/* Roda todos os roteiros de navegador, um por vez, e resume. Precisa do site servido em http://localhost:4600 (npm run dev). */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pasta = dirname(fileURLToPath(import.meta.url));
const roteiros = readdirSync(pasta).filter((n) => n.endsWith(".mjs") && !n.startsWith("_") && n !== "todos.mjs").sort();
let falharam = 0;
for (const nome of roteiros) {
  const r = spawnSync(process.execPath, [join(pasta, nome)], { encoding: "utf8" });
  const linhas = (r.stdout + r.stderr).trim().split("\n"), ruins = linhas.filter((l) => !l.startsWith("ok"));
  console.log(`${r.status === 0 && !ruins.length ? "ok    " : "FALHOU"} ${nome.padEnd(22)} ${linhas.filter((l) => l.startsWith("ok")).length} conferências`);
  if (r.status !== 0 || ruins.length) { falharam++; console.log(ruins.map((l) => `         ${l}`).join("\n")); }
}
process.exit(falharam ? 1 : 0);
