/* O ícone do atlas: o canto do aparelho, com a lente azul e duas luzes. O build escreve o SVG como ícone da
 * aba; scripts/vitrine.mjs tira dele os ícones em PNG que o celular usa ao instalar o atlas. */

const lente = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#20232B" stroke-width="${r * 0.2}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="#29AAFD"/><circle cx="${cx - r * 0.27}" cy="${cy - r * 0.27}" r="${r * 0.23}" fill="#C9ECFF"/>`;
const luz = (cx, cy, r, cor) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${cor}" stroke="#20232B" stroke-width="${r * 0.44}"/>`;

export const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#DC0A2D"/><path d="M0 46h30l10-9h24v13a14 14 0 0 1-14 14H14A14 14 0 0 1 0 50Z" fill="#9C0A22"/>${lente(24, 23, 15)}${luz(48, 13, 4.5, "#FFCB05")}${luz(48, 27, 4.5, "#45B25D")}</svg>`;

/* O mesmo desenho sem cantos arredondados e com folga em volta: o sistema do celular recorta o ícone no
 * formato que quiser (círculo, quadrado de cantos redondos), e o desenho precisa caber na parte que sobra. */
export const ICONE_CHEIO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#DC0A2D"/><path d="M0 47h30l10-9h24v26H0Z" fill="#9C0A22"/>${lente(27, 26, 12)}${luz(45, 18, 3.6, "#FFCB05")}${luz(45, 29, 3.6, "#45B25D")}</svg>`;
