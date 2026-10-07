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

/* ---------- cartas das regiões ----------
 * O traçado (costa, relevo, rotas dos mapas antigos) fica em dados/cartas.json,
 * gerado por scripts/cartas.mjs. Aqui ficam os lugares, marcados à mão sobre o
 * mapa de cada região nos jogos.
 *
 * Cada lugar: [nome, x, y, lado]. x e y são porcentagens do quadro; "lado" diz
 * para onde o nome se afasta do ponto: d (direita), e (esquerda), c (cima), b (baixo).
 * "areas" são nomes de extensões de terra ou mar, escritos sem ponto.
 * "rotas" são linhas [[x, y], ...] para as regiões cujo mapa não traz as rotas em faixa.
 */
export const MAPAS = {
  kanto: {
    cidades: [
      ["Indigo Plateau", 14, 29, "c"], ["Pewter City", 27, 36, "d"], ["Cerulean City", 66, 29, "c"],
      ["Celadon City", 54, 45, "e"], ["Saffron City", 66, 46, "c"], ["Lavender Town", 82, 46, "d"],
      ["Viridian City", 26, 56, "d"], ["Vermilion City", 66, 61, "e"], ["Pallet Town", 26, 72, "d"],
      ["Fuchsia City", 58, 77, "b"], ["Cinnabar Island", 26, 88, "e"]
    ],
    marcos: [
      ["Victory Road", 13.5, 35, "b"], ["Mt. Moon", 46, 29, "c"], ["Rock Tunnel", 82, 29, "d"],
      ["Power Plant", 82, 36, "d"], ["Viridian Forest", 26, 45, "e"], ["Diglett's Cave", 70, 61, "d"],
      ["Seafoam Islands", 40, 88, "b"]
    ]
  },
  johto: {
    cidades: [
      ["Ecruteak City", 45, 32, "e"], ["Mahogany Town", 68, 31, "b"], ["Blackthorn City", 85, 31, "b"],
      ["Olivine City", 15, 40, "c"], ["Violet City", 57, 44, "d"], ["Goldenrod City", 34, 66, "d"],
      ["Cianwood City", 7, 72, "d"], ["Cherrygrove City", 67, 79, "c"], ["New Bark Town", 89, 79, "c"],
      ["Azalea Town", 45, 92, "c"]
    ],
    marcos: [
      ["Lake of Rage", 68, 8, "d"], ["Dragon's Den", 85, 24, "c"], ["Mt. Mortar", 55, 31, "c"],
      ["Ice Path", 79.5, 31, "c"], ["National Park", 36, 44, "e"], ["Ruins of Alph", 51, 55, "d"],
      ["Whirl Islands", 13, 62, "d"], ["Ilex Forest", 34, 92, "e"], ["Union Cave", 57, 92, "d"]
    ]
  },
  hoenn: {
    cidades: [
      ["Fallarbor Town", 17, 21, "c"], ["Fortree City", 37, 21, "c"], ["Lavaridge Town", 22, 31, "b"],
      ["Lilycove City", 53, 31, "c"], ["Mossdeep City", 77, 38, "c"], ["Rustboro City", 6, 40, "d"],
      ["Verdanturf Town", 20, 42, "b"], ["Mauville City", 30, 43, "d"], ["Sootopolis City", 66, 51, "b"],
      ["Petalburg City", 12, 57, "b"], ["Oldale Town", 20, 57, "d"], ["Ever Grande City", 89, 61, "e"],
      ["Slateport City", 30, 67, "d"], ["Littleroot Town", 20, 69, "b"], ["Pacifidlog Town", 58, 69, "b"],
      ["Dewford Town", 14, 86, "d"]
    ],
    marcos: [["Meteor Falls", 9, 24, "b"], ["Mt. Chimney", 25, 26, "d"], ["Sky Pillar", 65, 65, "d"]]
  },
  sinnoh: {
    cidades: [
      ["Snowpoint City", 38, 6, "d"], ["Survival Area", 67, 21, "e"], ["Fight Area", 66, 33, "e"],
      ["Resort Area", 84, 38, "b"], ["Eterna City", 32, 47, "e"], ["Celestic Town", 48, 46, "c"],
      ["Pokémon League", 87, 50, "c"], ["Veilstone City", 72, 56, "e"], ["Floaroma Town", 19, 61, "e"],
      ["Solaceon Town", 59, 63, "d"], ["Hearthome City", 49, 69, "d"], ["Canalave City", 6, 73, "d"],
      ["Oreburgh City", 31, 76, "d"], ["Jubilife City", 17, 77, "b"], ["Sunyshore City", 88, 77, "e"],
      ["Pastoria City", 62, 85, "b"], ["Sandgem Town", 19, 88, "d"], ["Twinleaf Town", 12, 92, "b"]
    ],
    marcos: [
      ["Lake Acuity", 33, 8, "e"], ["Iron Island", 12, 43, "c"], ["Mt. Coronet", 41, 58, "d"],
      ["Lake Valor", 71, 77, "e"], ["Lake Verity", 8, 86, "c"]
    ],
    areas: [["Fullmoon e Newmoon", 12, 21]]
  },
  unova: {
    nota: "Esta carta segue o mapa de Black 2 e White 2, que inclui o sudoeste da região.",
    cidades: [
      ["Pokémon League", 66, 8, "e"], ["Humilau City", 91, 20, "c"], ["Icirrus City", 28.5, 26, "c"],
      ["Opelucid City", 51.5, 26, "b"], ["Lacunosa Town", 74, 26, "c"], ["Mistralton City", 15.5, 40, "e"],
      ["Lentimas Town", 73, 40, "c"], ["Undella Town", 87.5, 40, "b"], ["Driftveil City", 28.5, 54, "b"],
      ["Nimbasa City", 51.5, 54, "c"], ["Black City e White Forest", 74, 54, "b"], ["Nacrene City", 79, 70, "b"],
      ["Striaton City", 89, 70, "c"], ["Floccesy Town", 12.5, 76, "c"], ["Virbank City", 26.5, 76, "b"],
      ["Castelia City", 51.5, 77, "b"], ["Accumula Town", 90, 82, "e"], ["Aspertia City", 5, 91, "d"],
      ["Nuvema Town", 90, 93, "e"]
    ],
    marcos: [],
    rotas: [
      [[5, 91], [5.5, 78], [12.5, 76], [26.5, 76], [51.5, 77]],
      [[51.5, 77], [51.5, 54], [28.5, 54], [15.5, 40], [28.5, 26], [51.5, 26], [74, 26], [87.5, 40], [74, 54], [51.5, 54]],
      [[87.5, 40], [73, 40]],
      [[51.5, 26], [52.5, 19], [62, 18], [63.5, 14], [66, 8], [76, 9.5], [76.5, 21], [91, 20], [91.5, 30], [87.5, 40]],
      [[51.5, 77], [79, 70], [89, 70], [90, 82], [90, 93]]
    ]
  },
  kalos: {
    cidades: [
      ["Laverre City", 51.5, 11, "d"], ["Coumarine City", 34, 30, "c"], ["Dendemille Town", 68, 30, "c"],
      ["Shalour City", 15, 36, "c"], ["Lumiose City", 51.5, 37, "d"], ["Anistar City", 87, 37, "c"],
      ["Pokémon League", 73, 43, "c"], ["Couriway Town", 93, 45, "e"], ["Geosenge Town", 9, 47, "d"],
      ["Snowbelle City", 84, 55, "d"], ["Santalune City", 61, 56, "e"], ["Cyllage City", 17, 57, "e"],
      ["Camphrier Town", 41, 57, "b"], ["Aquacorde Town", 66, 74, "e"], ["Ambrette Town", 22, 75, "e"],
      ["Vaniville Town", 66, 85, "e"], ["Kiloude City", 75, 91, "d"]
    ],
    marcos: [
      ["Poké Ball Factory", 51.5, 6, "e"], ["Parfum Palace", 29, 44, "c"], ["Victory Road", 73, 55, "b"],
      ["Santalune Forest", 66, 64, "d"], ["Glittering Cave", 36, 75, "d"], ["Pokémon Village", 80, 75, "d"]
    ],
    rotas: [
      [[66, 85], [66, 74], [66, 64], [61, 56], [51.5, 37]],
      [[51.5, 37], [41, 57], [22, 57], [17, 57], [22, 75], [36, 75]],
      [[41, 57], [29, 44]],
      [[17, 57], [9, 47], [12, 40], [15, 36], [34, 30], [51.5, 37]],
      [[51.5, 6], [51.5, 11], [51.5, 37]],
      [[51.5, 11], [68, 30], [51.5, 37]],
      [[68, 30], [87, 37], [93, 45], [84, 55], [80, 75]],
      [[84, 55], [73, 55], [73, 43]],
      [[61, 56], [73, 55]]
    ]
  },
  alola: {
    cidades: [
      ["Paniola Town", 61, 20, "e"], ["Hau'oli City", 31, 29, "b"], ["Heahea City", 57, 36, "e"],
      ["Konikoni City", 71, 38, "d"], ["Seafolk Village", 20, 45, "d"], ["Po Town", 78, 52, "e"],
      ["Malie City", 90.5, 64, "c"], ["Tapu Village", 86, 81, "b"]
    ],
    marcos: [["Aether Paradise", 40, 60, "b"], ["Mount Lanakila", 83, 71, "e"]],
    areas: [["Melemele", 34, 9], ["Akala", 67, 6], ["Ula'ula", 87, 46], ["Poni", 15, 33]]
  },
  galar: {
    cidades: [
      ["Wyndon", 48, 13, "d"], ["Ballonlea", 19, 34.5, "d"], ["Circhester", 80, 37, "e"],
      ["Stow-on-Side", 23, 44.5, "d"], ["Hammerlocke", 48, 49.7, "c"], ["Spikemuth", 87, 49.5, "b"],
      ["Turffield", 23, 58.5, "c"], ["Hulbury", 71, 58, "c"], ["Motostoke", 48, 65.5, "b"],
      ["Wedgehurst", 51, 90, "d"], ["Postwick", 51, 96.5, "d"]
    ],
    marcos: [["Slumbering Weald", 30, 97, "e"]],
    areas: [["Wild Area", 45, 77]],
    rotas: [
      [[51, 96.5], [51, 90], [45, 84.5], [47, 76], [48, 71], [48, 65.5]],
      [[51, 90], [60, 88.3], [69, 86]],
      [[48, 65.5], [28, 65.7], [17, 65.5], [17, 60], [23, 58.5], [37, 58.2], [71, 58], [73, 62], [70, 65.3], [62, 65.5], [48, 65.5]],
      [[48, 65.5], [52, 60], [53, 52], [48, 49.7]],
      [[48, 49.7], [30, 49.7], [27, 47], [23, 44.5], [23, 38], [19, 34.5]],
      [[48, 49.7], [65, 49.7], [66, 46], [69, 43], [71, 40], [72, 38.5], [80, 37], [88, 38.3], [88, 44], [82, 47.5], [87, 49.5], [81, 49.8], [65, 49.7]],
      [[48, 49.7], [49, 36], [49, 33], [55, 31.5], [49, 28.5], [49, 21], [48, 13]]
    ]
  },
  hisui: {
    cidades: [["Jubilife Village", 29, 57, "e"]],
    marcos: [
      ["Lake Acuity", 36, 5, "d"], ["Firespit Island", 84, 25, "c"], ["Mount Coronet", 51, 36, "c"],
      ["Lake Valor", 72, 55, "c"], ["Lake Verity", 25, 73, "b"]
    ],
    areas: [
      ["Alabaster Icelands", 44, 16], ["Cobalt Coastlands", 82, 40], ["Coronet Highlands", 53, 48],
      ["Crimson Mirelands", 76, 64], ["Obsidian Fieldlands", 41, 68]
    ]
  },
  paldea: {
    cidades: [
      ["Montenevera", 55, 28, "c"], ["Medali", 40, 46, "c"], ["Porto Marinada", 10, 49, "c"],
      ["Cascarrafa", 29, 52, "c"], ["Zapapico", 63, 54, "c"], ["Levincia", 81, 56, "e"],
      ["Artazon", 75, 74, "d"], ["Mesagoza", 48, 76, "d"], ["Cortondo", 28, 77, "b"],
      ["Los Platos", 48, 87, "e"], ["Alfornada", 17, 89, "d"], ["Cabo Poco", 50, 92, "d"]
    ],
    marcos: [["Pokémon League", 39, 68, "e"]],
    areas: [
      ["Glaseado Mountain", 52, 21], ["Casseroya Lake", 23, 31], ["Asado Desert", 19, 56],
      ["Grande Cratera", 48, 60]
    ]
  }
};
