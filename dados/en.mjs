/* A versão em inglês do que a página inicial e a bússola mostram: os nomes dos eixos, a chamada e as notas
 * de cada jogo, o texto de cada região, os pedidos e as perguntas da bússola. O resto do atlas é só em
 * português. O build confere se nada daqui ficou para trás quando o original muda (scripts/build.mjs). */

export const EIXOS_EN = {
  exploracao: "Exploration", liberdade: "Freedom", competitivo: "Competitive",
  dificuldade: "Difficulty", historia: "Story", nostalgia: "Nostalgia"
};

export const CONSOLES_EN = { celular: "Mobile" };     // os outros são nomes próprios e ficam como estão

/* Por jogo: a chamada e as notas dos eixos que têm nota escrita (as mesmas chaves de dados/jogos.mjs). */
export const JOGOS_EN = {
  "red-blue-yellow": { chamada: "Where it all began: 151 species, eight gyms and a rival always one step ahead.",
    notas: { nostalgia: "It is the origin: every screen became a reference for everything that came after." } },
  "gold-silver-crystal": { chamada: "Two regions in a single cartridge, with a real clock marking day and night.",
    notas: { exploracao: "Sixteen gyms across two regions, with secrets tied to the clock.", nostalgia: "For many people, the high point of the Game Boy era." } },
  "ruby-sapphire-emerald": { chamada: "A tropical archipelago, double battles and a map that goes on underwater.",
    notas: { exploracao: "Sea routes, underwater caves and secret bases to set up.", nostalgia: "The trumpets of the soundtrack and the colors of the Game Boy Advance." } },
  "firered-leafgreen": { chamada: "The first trip through Kanto, remade with the comfort of the Game Boy Advance.",
    notas: { nostalgia: "Kanto as you remember it, not as it really was." } },
  "diamond-pearl-platinum": { chamada: "Myths about the creation of the world and a champion who does not forgive a badly built team.",
    notas: { exploracao: "Mount Coronet in the middle of the map and a whole underground to dig.", dificuldade: "Champion Cynthia became another word for a wall.", nostalgia: "The peak of the DS era for those who started there." } },
  "heartgold-soulsilver": { chamada: "Johto and Kanto remade with care, and your Pokémon walking right behind you.",
    notas: { exploracao: "Two whole regions, sixteen gyms and a battle park.", nostalgia: "The memory of Johto, the way memory made it prettier." } },
  "black-white": { chamada: "The generation that asked whether it is right to catch Pokémon, and took the question seriously.",
    notas: { historia: "N and Team Plasma give the series its most ambitious plot." } },
  "black-2-white-2": { chamada: "The direct sequel to Black and White: Unova two years later, with a hard mode.",
    notas: { dificuldade: "It has Challenge Mode, a difficulty setting that is rare in the series.", competitivo: "The Pokémon World Tournament pits you against leaders and champions from every region.", historia: "It ties up the loose ends of Black and White." } },
  "x-y": { chamada: "The jump to 3D, with Mega Evolution and a region inspired by France.",
    notas: { dificuldade: "One of the easiest in the series: great to start with, shallow for veterans." } },
  "omega-ruby-alpha-sapphire": { chamada: "Hoenn in 3D, with free flight over the map and an epilogue in space.",
    notas: { exploracao: "You can fly over the whole region and land on islands that only exist seen from above.", nostalgia: "The same routes and the same trumpets, now with depth." } },
  "sun-moon": { chamada: "Four tropical islands where gyms gave way to trials and rituals.",
    notas: { historia: "Lillie's family carries one of the most personal plots in the series." } },
  "ultra-sun-ultra-moon": { chamada: "Alola revisited, with more species, more challenge and a feared boss.",
    notas: { dificuldade: "Ultra Necrozma is one of the toughest mandatory bosses in the series.", competitivo: "A wide roster and move tutors to build teams.", historia: "It keeps Alola's cast and adds an epilogue with classic villains." } },
  "lets-go-pikachu-eevee": { chamada: "Kanto to play on the couch, catching with the motion of the controller.",
    notas: { nostalgia: "Kanto and the original 151 species, looking like a cartoon.", dificuldade: "Made so that nobody gets stuck." } },
  "sword-shield": { chamada: "Gyms in packed stadiums and the most practical way into competitive play.",
    notas: { competitivo: "Mints and capsules made team building more accessible than ever." } },
  "brilliant-diamond-shining-pearl": { chamada: "The Sinnoh of 2006 rebuilt on the Switch, faithful down to the details.",
    notas: { nostalgia: "The same Sinnoh of 2006, screen by screen." } },
  "legends-arceus": { chamada: "Sinnoh centuries ago: you, a handful of Poké Balls and the first Pokédex still to be written.",
    notas: { exploracao: "Open areas where watching and catching matter more than fighting.", liberdade: "You decide what to research and how to approach each species." } },
  "scarlet-violet": { chamada: "The first true open world: three stories, in whatever order you like.",
    notas: { exploracao: "One continuous map, with no gates between areas.", liberdade: "Three story paths to follow in any order.", competitivo: "Raids, Terastal and full tools for building teams.", historia: "The three paths converge in a memorable final act." } },
  "legends-z-a": { chamada: "A whole city as the map and, for the first time, battles in real time.",
    notas: { historia: "Lumiose and its residents carry the plot from start to finish." } },
  "colosseum-xd": { chamada: "A desert with no wild Pokémon, where you take back the ones that were corrupted.",
    notas: { dificuldade: "Double battles against opponents that punish an unbalanced team.", historia: "A plot about organized crime, rare in the franchise.", nostalgia: "The console RPG a whole generation was waiting for." } },
  "mystery-dungeon-explorers-of-sky": { chamada: "You wake up turned into a Pokémon, and the story that follows makes a lot of people cry.",
    notas: { historia: "One of the most loved plots in anything that carries the Pokémon name.", dificuldade: "The post-game dungeons show no mercy.", nostalgia: "A DS classic that many people hold dear." } },
  conquest: { chamada: "Pokémon on a war board in feudal Japan.", notas: {} },
  "pokemon-go": { chamada: "The map is your city: to catch, you have to leave the house.",
    notas: { exploracao: "Exploration is literal: what you find depends on where you walk.", liberdade: "No campaign: you play when, where and as much as you want.", nostalgia: "It brought the original 151 back into many people's daily lives." } },
  "pokken-tournament-dx": { chamada: "A real fighting game, made by the Tekken studio.",
    notas: { competitivo: "A complete fighting game, with ranked online matches.", dificuldade: "It demands reading your opponent and training your reactions." } },
  "mystery-dungeon-rescue-team-dx": { chamada: "The first Mystery Dungeon, remade as a picture book in watercolor.",
    notas: { historia: "A short fable about friendship, told without hurry.", nostalgia: "The same game from 2005, redrawn by hand." } },
  "new-pokemon-snap": { chamada: "A photo safari: no battles, only patience and good framing.",
    notas: { exploracao: "Every route hides detours and behaviors that only show up if you insist." } },
  "pokemon-unite": { chamada: "Five against five, ten minutes a match, and whoever scores more wins.",
    notas: { competitivo: "Ranked team matches, with defined roles." } },
  "detective-pikachu-returns": { chamada: "A Pikachu in a cap, hooked on coffee, solving crimes with you.",
    notas: { historia: "It is all story: a mystery told case by case." } },
  "tcg-pocket": { chamada: "Opening card packs every day, on your phone screen.",
    notas: { nostalgia: "The feeling of tearing open a pack, intact." } },
  pokopia: { chamada: "You are a Ditto disguised as a person, rebuilding a world for the Pokémon to come back.",
    notas: { liberdade: "The land is yours: you decide what to plant, what to build and who to attract.", exploracao: "New areas and residents appear as the world recovers." } },
  champions: { chamada: "Battles only: the new home of competitive Pokémon.",
    notas: { competitivo: "It was made just for this: ranked play, private matches and cross-platform play.", dificuldade: "On the other side there is always a person trying to win." } }
};

export const REGIOES_EN = {
  kanto: { inspiracao: "Inspired by Kanto, Japan", texto: "Where it all began. A compact map of cities named after colors, visited and revisited since 1996." },
  johto: { inspiracao: "Inspired by Kansai, Japan", texto: "Kanto's neighbor, and older at heart: towers, shrines and traditions that stand the test of time." },
  hoenn: { inspiracao: "Inspired by Kyushu, Japan", texto: "A tropical archipelago where half the map is sea. Jungle, desert, volcano and diving." },
  sinnoh: { inspiracao: "Inspired by Hokkaido, Japan", texto: "Cold in the north and cut in half by Mount Coronet. A land of myths about the origin of time and space." },
  unova: { inspiracao: "Inspired by New York", texto: "The first region inspired outside Japan: bridges, skyscrapers and a metropolis right in the center." },
  kalos: { inspiracao: "Inspired by France", texto: "Shaped like a star, with a city of light in the middle. Cafés, castles, fashion and a tower you can see from afar." },
  alola: { inspiracao: "Inspired by Hawaii", texto: "Four tropical islands where gyms give way to trials and rituals passed down through generations." },
  galar: { inspiracao: "Inspired by the United Kingdom", texto: "Long from south to north, from countryside to industrial cities, with packed stadiums on battle day." },
  hisui: { inspiracao: "The Sinnoh of centuries ago", texto: "Sinnoh before it had that name: nature almost untouched and the first Pokédex still to be written." },
  paldea: { inspiracao: "Inspired by the Iberian Peninsula", texto: "An open land around a huge crater, to travel in whatever order you like." }
};

/* Os pedidos da cena do hexágono e as duas pontas de cada eixo (o que um jogo "tem" quando a nota é alta e
 * o que acontece "aqui" quando ela é baixa), usadas nas explicações da bússola. */
export const PEDIDOS_EN = {
  exploracao: { frase: "I want to get lost in a huge map.", alto: "has a lot of map to cover", baixo: "the world is small or guided" },
  liberdade: { frase: "I want to do it my way, in the order I choose.", alto: "lets you choose the path", baixo: "there is only one path" },
  competitivo: { frase: "I want to battle real people.", alto: "has serious battling against other people", baixo: "there is almost nothing to contest against other people" },
  dificuldade: { frase: "I want to sweat for the win.", alto: "demands preparation", baixo: "it rarely gets you stuck" },
  historia: { frase: "I want a good story.", alto: "has a plot that holds you", baixo: "the story is a backdrop" },
  nostalgia: { frase: "I want to go back home.", alto: "stirs your memory", baixo: "it is something new, with no longing involved" }
};

/* As perguntas da bússola, na mesma ordem de dados/quiz.mjs e com as opções na mesma ordem (os pesos e os
 * filtros vêm de lá; aqui fica só o texto). */
export const PERGUNTAS_EN = [
  { pergunta: "What brings you here?", opcoes: ["Going back to a place I already know", "Living an adventure I have not lived yet", "Getting really good at battles", "Relaxing, with no obligations at all"] },
  { pergunta: "Faced with a new map, you…", opcoes: ["Go to every corner before moving on", "Pick any direction and see what happens", "Follow the main trail to find out what happens next", "Look for the next opponent right away"] },
  { pergunta: "How do you like the story to arrive?", opcoes: ["With a plot and characters I will remember", "As a backdrop that does not get in the way of the walk", "I would rather make up my own", "Either way: I came for the battles"] },
  { pergunta: "And the difficulty?", opcoes: ["I want to lose a few times before I win", "A fair challenge that makes me think", "Easygoing: I do not want to get stuck"] },
  { pergunta: "The credits have rolled. What keeps you going?", opcoes: ["Building the perfect team and facing other people", "Completing the Pokédex and finding what stayed hidden", "Starting over, in a different way", "Nothing: I finished the story, I closed the game"] },
  { pergunta: "Which of these lines sounds most like you?", opcoes: ["“It was better in my day.”", "“I want to see the newest thing there is.”", "“The era does not matter: I want the best.”"] },
  { pergunta: "Where do you plan to play?", opcoes: ["On a Nintendo Switch", "On a Nintendo Switch 2", "On my phone", "I have the old consoles, or that does not limit me"] },
  { pergunta: "Does it have to be the classic catch-and-battle adventure?", opcoes: ["Yes, I want the main series", "No: I am up for any format"] }
];
