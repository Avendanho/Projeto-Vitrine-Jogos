/* As músicas do atlas, escritas como partitura, e as contas que não tocam em nada: servem ao navegador
 * (som.js) e aos testes. As duas músicas são do próprio atlas, compostas para ele; nenhuma vem dos jogos.
 *
 * Cada voz é uma linha de passos separados por espaço, todos com a mesma duração (uma colcheia):
 *   C4, F#5…  uma nota começa
 *   _         a nota anterior continua soando
 *   -         silêncio
 *   x         um toque de percussão (só nas vozes de onda "ruido")
 * Uma barra vertical separa os compassos e não conta como passo.
 */

const SEMITONS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/* A frequência de uma nota escrita, em hertz, com o lá da quarta oitava em 440. Devolve null se não for nota. */
export function frequencia(nota) {
  const m = /^([A-G])(#|b)?(\d)$/.exec(nota);
  if (!m) return null;
  const semitom = SEMITONS[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (Number(m[3]) + 1) * 12;   // número MIDI
  return 440 * 2 ** ((semitom - 69) / 12);
}

export const MUSICAS = {
  /* Edição Pokémon: uma cidade tranquila em ondas quadradas, como num portátil. Dó maior, oito compassos. */
  pokemon: {
    bpm: 104,
    vozes: [
      { onda: "square", volume: 0.05, solta: 0.08, notas:
        "E5 _ G5 _ C6 _ B5 A5 | G5 _ E5 _ A5 _ _ - | F5 _ A5 _ C6 _ A5 F5 | G5 _ _ D5 G5 _ B5 - | " +
        "E5 _ G5 _ C6 _ D6 E6 | D6 _ C6 _ A5 _ _ - | F5 _ A5 _ D6 _ C6 A5 | B5 _ G5 _ D5 _ _ -" },
      { onda: "square", volume: 0.022, solta: 0.05, notas:
        "C4 E4 G4 E4 C4 E4 G4 E4 | A3 C4 E4 C4 A3 C4 E4 C4 | F3 A3 C4 A3 F3 A3 C4 A3 | G3 B3 D4 B3 G3 B3 D4 B3 | " +
        "C4 E4 G4 E4 C4 E4 G4 E4 | A3 C4 E4 C4 A3 C4 E4 C4 | D4 F4 A4 F4 D4 F4 A4 F4 | G3 B3 D4 B3 G3 B3 D4 B3" },
      { onda: "triangle", volume: 0.11, solta: 0.1, notas:
        "C3 _ _ - G2 _ _ - | A2 _ _ - E2 _ _ - | F2 _ _ - C3 _ _ - | G2 _ _ - D3 _ _ - | " +
        "C3 _ _ - G2 _ _ - | A2 _ _ - E2 _ _ - | D3 _ _ - A2 _ _ - | G2 _ _ - G2 _ D3 -" },
      { onda: "ruido", volume: 0.018, solta: 0.03, notas:
        "- - x - - - x - | - - x - - - x - | - - x - - - x - | - - x - - - x x | " +
        "- - x - - - x - | - - x - - - x - | - - x - - - x - | - - x - x - x x" }
    ]
  },
  /* Edição Cobblemon: notas soltas e longas sobre um chão grave, para quem anda devagar por um mapa. Ré pentatônico. */
  cobblemon: {
    bpm: 66,
    eco: 0.34,
    vozes: [
      { onda: "sine", volume: 0.09, solta: 1.6, notas:
        "F#4 _ _ A4 _ _ D5 _ | - - B4 _ _ - A4 _ | E4 _ _ F#4 _ _ B4 _ | - - A4 _ _ - - - | " +
        "D4 _ _ A4 _ _ F#5 _ | - - E5 _ _ D5 _ - | B4 _ _ A4 _ _ F#4 _ | E4 _ _ _ - - - -" },
      { onda: "triangle", volume: 0.06, solta: 1.2, notas:
        "D3 _ _ _ _ _ _ _ | _ _ _ _ _ _ _ - | B2 _ _ _ _ _ _ _ | _ _ _ _ _ _ _ - | " +
        "G2 _ _ _ _ _ _ _ | _ _ _ _ _ _ _ - | A2 _ _ _ _ _ _ _ | _ _ _ _ _ _ _ -" }
    ]
  }
};

/* Lê uma música e devolve o que tocar em cada passo: { passos, duracao (segundos de um passo), eventos },
 * com um evento por nota: { passo, voz, freq (null na percussão), passos (quantos ela dura) }. */
export function partitura(musica) {
  const duracao = 60 / musica.bpm / 2, eventos = [];
  let passos = 0;
  musica.vozes.forEach((voz, v) => {
    const linha = voz.notas.split(/\s+/).filter((t) => t && t !== "|");
    passos = Math.max(passos, linha.length);
    linha.forEach((t, i) => {
      if (t === "-" || t === "_") return;
      let dura = 1;
      while (linha[i + dura] === "_") dura++;
      eventos.push({ passo: i, voz: v, freq: t === "x" ? null : frequencia(t), passos: dura });
    });
  });
  return { passos, duracao, eventos };
}
