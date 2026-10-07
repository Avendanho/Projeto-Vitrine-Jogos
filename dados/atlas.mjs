/* Vocabulário do atlas: regiões, consoles, estilos, perfis e marcos da linha do tempo.
 * Só fatos verificáveis. O ano de cada jogo é o do primeiro lançamento em qualquer país. */

export const REGIOES = [
  { id: "kanto", nome: "Kanto", geracao: 1, inspiracao: "Inspirada em Kanto, no Japão", iniciais: [1, 4, 7],
    texto: "Onde tudo começou. Um mapa compacto de cidades com nomes de cores, visitado e revisitado desde 1996.",
    cenario: { semente: 11, altura: 0.5, aspereza: 0.5, marco: "cone", marcoX: 0.72 } },
  { id: "johto", nome: "Johto", geracao: 2, inspiracao: "Inspirada em Kansai, no Japão", iniciais: [152, 155, 158],
    texto: "Vizinha de Kanto e mais antiga na alma: torres, santuários e tradições que resistem ao tempo.",
    cenario: { semente: 23, altura: 0.56, aspereza: 0.62, marco: "torre", marcoX: 0.3 } },
  { id: "hoenn", nome: "Hoenn", geracao: 3, inspiracao: "Inspirada em Kyushu, no Japão", iniciais: [252, 255, 258],
    texto: "Um arquipélago tropical em que metade do mapa é mar. Selva, deserto, vulcão e mergulho.",
    cenario: { semente: 37, altura: 0.6, aspereza: 0.45, marco: "vulcao", marcoX: 0.36, mar: 0.4 } },
  { id: "sinnoh", nome: "Sinnoh", geracao: 4, inspiracao: "Inspirada em Hokkaido, no Japão", iniciais: [387, 390, 393],
    texto: "Fria ao norte e cortada ao meio pelo Monte Coronet. Terra de mitos sobre a origem do tempo e do espaço.",
    cenario: { semente: 41, altura: 0.92, aspereza: 0.9, marco: "pico", marcoX: 0.52, neve: true } },
  { id: "unova", nome: "Unova", geracao: 5, inspiracao: "Inspirada em Nova York", iniciais: [495, 498, 501],
    texto: "A primeira região inspirada fora do Japão: pontes, arranha-céus e uma metrópole bem no centro.",
    cenario: { semente: 53, altura: 0.38, aspereza: 0.35, marco: "cidade", marcoX: 0.5 } },
  { id: "kalos", nome: "Kalos", geracao: 6, inspiracao: "Inspirada na França", iniciais: [650, 653, 656],
    texto: "Em forma de estrela, com uma cidade-luz no meio. Cafés, castelos, moda e uma torre que se vê de longe.",
    cenario: { semente: 67, altura: 0.48, aspereza: 0.5, marco: "agulha", marcoX: 0.5 } },
  { id: "alola", nome: "Alola", geracao: 7, inspiracao: "Inspirada no Havaí", iniciais: [722, 725, 728],
    texto: "Quatro ilhas tropicais onde os ginásios dão lugar a provas e rituais passados de geração em geração.",
    cenario: { semente: 71, altura: 0.58, aspereza: 0.4, marco: "vulcao", marcoX: 0.66, mar: 0.55 } },
  { id: "galar", nome: "Galar", geracao: 8, inspiracao: "Inspirada no Reino Unido", iniciais: [810, 813, 816],
    texto: "Comprida de sul a norte, do campo às cidades industriais, com estádios lotados em dia de batalha.",
    cenario: { semente: 83, altura: 0.5, aspereza: 0.55, marco: "cidade", marcoX: 0.28, neve: true } },
  { id: "hisui", nome: "Hisui", geracao: 8, inspiracao: "A Sinnoh de séculos atrás", iniciais: [722, 155, 501],
    texto: "Sinnoh antes de ter esse nome: natureza quase intocada e a primeira Pokédex ainda por escrever.",
    cenario: { semente: 97, altura: 0.96, aspereza: 0.95, marco: "pico", marcoX: 0.44, neve: true } },
  { id: "paldea", nome: "Paldea", geracao: 9, inspiracao: "Inspirada na Península Ibérica", iniciais: [906, 909, 912],
    texto: "Um território aberto ao redor de uma cratera enorme, para percorrer na ordem que você quiser.",
    cenario: { semente: 109, altura: 0.6, aspereza: 0.6, marco: "cratera", marcoX: 0.5 } }
];

export const OUTRAS_REGIOES = { id: "outras", nome: "Fora do mapa" };

export const CONSOLES = [
  { id: "gb", nome: "Game Boy" },
  { id: "gbc", nome: "Game Boy Color" },
  { id: "gba", nome: "Game Boy Advance" },
  { id: "gc", nome: "GameCube" },
  { id: "ds", nome: "Nintendo DS" },
  { id: "3ds", nome: "Nintendo 3DS" },
  { id: "celular", nome: "Celular" },
  { id: "switch", nome: "Nintendo Switch" },
  { id: "switch2", nome: "Nintendo Switch 2" }
];

export const ESTILOS = [
  { id: "rpg-classico", nome: "RPG clássico" },
  { id: "mundo-aberto", nome: "Mundo aberto" },
  { id: "acao", nome: "Ação e captura" },
  { id: "roguelike", nome: "Masmorras" },
  { id: "estrategia", nome: "Estratégia tática" },
  { id: "batalha", nome: "Batalhas competitivas" },
  { id: "luta", nome: "Luta" },
  { id: "moba", nome: "Arena em equipe" },
  { id: "fotografia", nome: "Fotografia" },
  { id: "aventura", nome: "Aventura narrativa" },
  { id: "simulacao", nome: "Vida e construção" },
  { id: "mundo-real", nome: "Mundo real" },
  { id: "cartas", nome: "Cartas" }
];

export const TIPOS = [
  { id: "principal", nome: "Série principal" },
  { id: "remake", nome: "Remake" },
  { id: "legends", nome: "Legends" },
  { id: "derivado", nome: "Derivado" }
];

/* Perfil de jogador: um jogo pertence ao perfil quando a nota do eixo é 4 ou 5. */
export const PERFIS = [
  { id: "explorador", nome: "Explorador", eixo: "exploracao" },
  { id: "livre", nome: "Espírito livre", eixo: "liberdade" },
  { id: "competidor", nome: "Competidor", eixo: "competitivo" },
  { id: "desafiante", nome: "Desafiante", eixo: "dificuldade" },
  { id: "leitor", nome: "Caçador de histórias", eixo: "historia" },
  { id: "nostalgico", nome: "Nostálgico", eixo: "nostalgia" }
];

/* O que cada direção da bússola significa, na voz de quem procura.
 * "eleito" é a escolha editorial do atlas entre os jogos de nota máxima no eixo. */
export const PEDIDOS = {
  exploracao: { frase: "Quero me perder num mapa enorme.", eleito: "legends-arceus",
    alto: "tem muito mapa para percorrer", baixo: "o mundo é pequeno ou guiado" },
  liberdade: { frase: "Quero fazer do meu jeito, na ordem que eu quiser.", eleito: "scarlet-violet",
    alto: "deixa você escolher o caminho", baixo: "o caminho é um só" },
  competitivo: { frase: "Quero batalhar contra gente de verdade.", eleito: "champions",
    alto: "tem batalha séria contra outras pessoas", baixo: "quase não há o que disputar contra outras pessoas" },
  dificuldade: { frase: "Quero suar para vencer.", eleito: "black-2-white-2",
    alto: "exige preparo", baixo: "raramente trava" },
  historia: { frase: "Quero uma boa história.", eleito: "black-white",
    alto: "tem enredo que segura", baixo: "a história é pano de fundo" },
  nostalgia: { frase: "Quero voltar para casa.", eleito: "heartgold-soulsilver",
    alto: "mexe com a memória", baixo: "é coisa nova, sem saudade envolvida" }
};

export const MARCOS = [
  { ano: 1996, texto: "Em 27 de fevereiro, Pocket Monsters Red e Green chegam às lojas do Japão para o Game Boy." },
  { ano: 1998, texto: "Red e Blue desembarcam na América do Norte, e a febre vira mundial." },
  { ano: 2013, texto: "X e Y saem no mundo inteiro no mesmo dia, pela primeira vez na série principal." },
  { ano: 2016, texto: "Pokémon GO leva a franquia para as ruas." },
  { ano: 2019, texto: "Sword e Shield estreiam uma geração inteira num console que também se liga à TV." },
  { ano: 2022, texto: "Legends: Arceus e Scarlet e Violet saem no mesmo ano, e a fórmula se abre." },
  { ano: 2026, texto: "A franquia completa trinta anos." }
];

export const HORIZONTE = {
  ano: 2027,
  titulo: "Pokémon Winds e Pokémon Waves",
  texto: "A décima geração, anunciada em 27 de fevereiro de 2026 para o Nintendo Switch 2. Ainda sem data marcada; por isso, ainda sem ilha neste atlas."
};

export const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
