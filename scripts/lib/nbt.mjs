/* Leitor mínimo de NBT (o formato binário dos arquivos de estrutura do Minecraft). */
import { gunzipSync } from "node:zlib";

export function lerNbt(bytes) {
  const b = bytes[0] === 0x1f && bytes[1] === 0x8b ? gunzipSync(bytes) : bytes;
  let p = 0;
  const texto = () => { const n = b.readUInt16BE(p); p += 2; const s = b.toString("utf8", p, p + n); p += n; return s; };
  function valor(tipo) {
    switch (tipo) {
      case 1: return b.readInt8(p++);
      case 2: p += 2; return b.readInt16BE(p - 2);
      case 3: p += 4; return b.readInt32BE(p - 4);
      case 4: p += 8; return Number(b.readBigInt64BE(p - 8));
      case 5: p += 4; return b.readFloatBE(p - 4);
      case 6: p += 8; return b.readDoubleBE(p - 8);
      case 7: { const n = b.readInt32BE(p); p += 4 + n; return b.subarray(p - n, p); }
      case 8: return texto();
      case 9: { const t = b[p++], n = b.readInt32BE(p); p += 4; const l = []; for (let i = 0; i < n; i++) l.push(valor(t)); return l; }
      case 10: { const o = {}; for (;;) { const t = b[p++]; if (t === 0) return o; const nome = texto(); o[nome] = valor(t); } }
      case 11: { const n = b.readInt32BE(p); p += 4; const l = []; for (let i = 0; i < n; i++) { l.push(b.readInt32BE(p)); p += 4; } return l; }
      case 12: { const n = b.readInt32BE(p); p += 4; const l = []; for (let i = 0; i < n; i++) { l.push(Number(b.readBigInt64BE(p))); p += 8; } return l; }
      default: throw new Error(`etiqueta NBT desconhecida: ${tipo}`);
    }
  }
  const tipo = b[p++];
  texto();
  return valor(tipo);
}
