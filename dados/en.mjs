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

/* ---------- as fichas dos jogos ---------- */

export const ESTILOS_EN = {
  "rpg-classico": "Classic RPG", "mundo-aberto": "Open world", acao: "Action and catching", roguelike: "Dungeons",
  estrategia: "Tactical strategy", batalha: "Competitive battles", luta: "Fighting", moba: "Team arena",
  fotografia: "Photography", aventura: "Narrative adventure", simulacao: "Life and building", "mundo-real": "Real world", cartas: "Cards"
};
export const CATEGORIAS_EN = { principal: "Main series", remake: "Remake", legends: "Legends", derivado: "Spin-off" };
export const TIPOS_EN = {
  Normal: "Normal", Fogo: "Fire", "Água": "Water", Planta: "Grass", "Elétrico": "Electric", Gelo: "Ice", Lutador: "Fighting",
  Venenoso: "Poison", Terrestre: "Ground", Voador: "Flying", "Psíquico": "Psychic", Inseto: "Bug", Pedra: "Rock",
  Fantasma: "Ghost", "Dragão": "Dragon", Sombrio: "Dark", "Aço": "Steel", Fada: "Fairy"
};
/* Os nomes das listas de Pokédex que não são nomes próprios. */
export const LISTAS_EN = { "Kalos Central": "Central Kalos", "Kalos Costeira": "Coastal Kalos", "Kalos Montanhosa": "Mountain Kalos", Elenco: "Roster" };

/* Por jogo: os dois parágrafos, "é para você, se" e "talvez não seja, se", na mesma ordem do original, e as
 * notas da Pokédex e o cenário, quando o original os tem. */
export const FICHAS_EN = {
  "red-blue-yellow": {
    texto: ["This is the mold the whole franchise came out of. You pick a starter, cross Kanto from city to city, defeat eight gym leaders and try to complete the first Pokédex. All in four shades, on a screen the size of a stamp.",
      "Playing it today is an exercise in archaeology: the interface is harsh, the bag fills up fast and the balance between types has famous holes. But the pace is direct and the map design is still exemplary. Yellow, from 1998, puts a Pikachu walking behind you."],
    paraQuem: ["Want to see where it all came from", "Have fond memories of the Game Boy", "Like short, direct games"],
    naoSe: ["An old interface wears out your patience", "You expect an elaborate story"] },
  "gold-silver-crystal": {
    texto: ["Johto introduces a hundred new species, Pokémon breeding, held items and an internal clock: there are creatures that only show up at night and events that only happen on certain days of the week. The world starts to have a routine.",
      "When the League is over, the game opens all of Kanto for a second round of eight gyms, up to a final duel on top of a mountain. Crystal, from 2000, adds animated sprites and the option to play as a girl."],
    paraQuem: ["Want the feeling of a world that never ends", "Value a generous post-game", "Remember the Game Boy Color fondly"],
    naoSe: ["You prefer a fast pace: levels climb slowly", "You want the comfort of a modern interface"] },
  "ruby-sapphire-emerald": {
    texto: ["Hoenn trades the plains for jungle, desert, volcano and a lot of sea. This is where double battles, abilities and natures appear: the pieces that make combat what it is to this day.",
      "With Surf and Dive, the map gains an underwater layer. Emerald, from 2004, joins the two plots and brings the Battle Frontier, a post-game challenge park that is still a reference."],
    paraQuem: ["Like exploring by land, by sea and along the sea floor", "Want to understand the foundations of competitive play", "Grew up with the Game Boy Advance"],
    naoSe: ["Long stretches of sailing tire you", "You are after a plot with weight"] },
  "firered-leafgreen": {
    texto: ["The script is the one from 1996, almost scene by scene, but with the rules of the third generation: abilities, natures, an organized bag and a help screen for newcomers. It is the cleanest way to get to know the original story.",
      "After the League, a brand-new archipelago, the Sevii Islands, extends the adventure and makes room for species from Johto."],
    paraQuem: ["Want Kanto without the rough edges of 1996", "Are playing Pokémon for the first time on a classic handheld", "Like colorful pixel art"],
    naoSe: ["You already know Kanto by heart and want something new", "You are looking for a high challenge"] },
  "diamond-pearl-platinum": {
    texto: ["Sinnoh is cold, mountainous and full of legends about the origin of time and space. The fourth generation starts classifying each move as physical or special, a change that reorganized all of combat, and takes trades and battles online for the first time.",
      "Platinum, from 2008, is the version to look for: a faster pace, more species available, the Distortion World and a Battle Frontier of its own."],
    paraQuem: ["Want a League that demands preparation", "Like mythology and legendaries that matter to the plot", "Played on the DS and want to see Sinnoh's underground again"],
    naoSe: ["A slow pace bothers you, especially in Diamond and Pearl", "You want an easy game"],
    pokedexNota: "Platinum's list. Diamond and Pearl have the first 151." },
  "heartgold-soulsilver": {
    texto: ["A remake of Gold and Silver that cuts nothing and adds a lot. The first Pokémon in your team walks behind you on the map, both regions are back with sixteen gyms, and Platinum's Battle Frontier comes along.",
      "The cartridge shipped with the Pokéwalker, a pedometer that took a Pokémon for a walk in your pocket. Many people call this the best game in the series; after a few gyms, you can see why."],
    paraQuem: ["Want the most content in a single cartridge", "Played Gold or Silver and want to go back", "Like bonding with your team"],
    naoSe: ["An uneven level curve frustrates you", "You are looking for something truly new"] },
  "black-white": {
    texto: ["Unova was a fresh start: until the credits, only brand-new species appear, as if it were the first game all over again. The plot puts you up against N and Team Plasma, who argue for the liberation of Pokémon, and the ending breaks the usual order of gyms, League and champion.",
      "The sprites move all the time, the seasons change the map and the soundtrack reacts to the battle. The path, on the other hand, is an almost straight line."],
    paraQuem: ["Want the most ambitious story in the main series", "Like meeting a completely new cast", "Think Pokémon can have something to say"],
    naoSe: ["You want freedom to leave the route", "You insist on the classic Pokémon from the start"] },
  "black-2-white-2": {
    texto: ["Instead of a third version, the fifth generation got a sequel. Unova comes back two years older, with new cities, reorganized routes and species from every region available from the start.",
      "There is plenty to do after the credits: the Pokémon World Tournament gathers leaders and champions from earlier generations, and Challenge Mode raises the level of your opponents, a difficulty setting that is rare in the series."],
    paraQuem: ["Want a challenge inside the classic formula", "Finished Black or White and want to know what came next", "Like a full post-game"],
    naoSe: ["You have not played Black or White: the plot loses strength", "Having to unlock Challenge Mode annoys you"] },
  "x-y": {
    texto: ["The first main adventure entirely in 3D models and the first simultaneous worldwide release in the series. Kalos brings Mega Evolution, the Fairy type and the chance to customize your trainer's look.",
      "It is a generous game: the Exp. Share spreads experience across the whole team, and you get a Kanto starter along the way. It ends up easy and the plot goes by fast, but few titles are as welcoming for someone who is just starting."],
    paraQuem: ["Are playing Pokémon for the first time", "Want a light, pretty adventure", "Are curious about Mega Evolution"],
    naoSe: ["You want to be challenged", "You expect a robust post-game"] },
  "omega-ruby-alpha-sapphire": {
    texto: ["A remake of Ruby and Sapphire with everything the sixth generation brought: Mega Evolution, Primal forms for Groudon and Kyogre and a radar that shows which species are still missing on each route.",
      "With the Eon Flute, you fly over Hoenn on the back of Latios or Latias and land wherever you want. After the League, the Delta Episode delivers an extra chapter of story. Emerald's Battle Frontier, however, was left out."],
    paraQuem: ["Love Hoenn and want to see it again in 3D", "Like hunting rare species", "Want a remake with a brand-new chapter"],
    naoSe: ["You were expecting the Battle Frontier", "You want above-average difficulty"] },
  "sun-moon": {
    texto: ["Alola trades the gym structure for an island challenge: trials with their own rules, closed by a Totem Pokémon that calls for backup. It is one of the biggest changes of formula the series has ever made.",
      "The story gives the characters a lot of screen time, Lillie above all, and so the beginning is heavy with dialogue. Regional forms and Z-Moves debut here."],
    paraQuem: ["Want characters with a real arc", "Are tired of eight gyms", "Like a tropical mood and an unhurried pace"],
    naoSe: ["Tutorials and long scenes make you impatient", "You want to explore freely"] },
  "ultra-sun-ultra-moon": {
    texto: ["Expanded versions of Sun and Moon: the same trip across the islands, with the plot changed in the final stretch, new areas and many more Pokémon available. The trials became more demanding, and the fight against Ultra Necrozma is among the hardest the series has ever put on the mandatory path.",
      "After the credits, the Team Rainbow Rocket episode gathers the villains of earlier generations. For those who will only play one Alola pair, it is usually this one."],
    paraQuem: ["Want the most complete version of Alola", "Like bosses that demand strategy", "Want to meet old villains again"],
    naoSe: ["You have just finished Sun or Moon: a lot repeats", "Long dialogues tire you"] },
  "lets-go-pikachu-eevee": {
    texto: ["A retelling of Yellow made to welcome those who came from Pokémon GO. Wild Pokémon appear walking on the map and catching needs no battle: you just throw the Poké Ball with the right gesture. Battles against trainers keep the classic format.",
      "A second person can join at any time to help, and your partner, Pikachu or Eevee, rides on your shoulder for the whole trip. It is short, easy, and was made to be that way."],
    paraQuem: ["Are playing with a child or with someone who has never played", "Came from Pokémon GO", "Want to see Kanto again with no strings attached"],
    naoSe: ["You want to battle wild Pokémon", "You are looking for depth or challenge"] },
  "sword-shield": {
    texto: ["In Galar, a gym battle is an arena sport, with a crowd and giant Pokémon for three turns. The Wild Area is the first open space in the series, with a free camera and weather that changes the species of the day.",
      "What aged best was behind the scenes: Mints, capsules and items that cut the work of preparing a competitive team from weeks to hours. The Isle of Armor and Crown Tundra expansions add two whole open areas."],
    paraQuem: ["Want to start playing competitively", "Like cooperative online raids", "Want a brisk campaign"],
    naoSe: ["You expect deep exploration outside the Wild Area", "You insist on every species: not all of them are in the game"],
    pokedexNota: "Isle of Armor and Crown Tundra are the two paid expansions." },
  "brilliant-diamond-shining-pearl": {
    texto: ["A remake that chose to preserve: the map, the encounters and the pace are those of Diamond and Pearl, with miniature-style characters and battles in 3D. The Grand Underground expands the old tunnel network with hideaways where Pokémon roam in plain sight.",
      "Faithfulness has a price: Platinum's improvements were left out. In return, the League was strengthened, and the rematches against the Elite Four use competitive-level teams."],
    paraQuem: ["Want to get to know Sinnoh on a current console", "Prefer the classic without reinvention", "Like a demanding endgame"],
    naoSe: ["You were expecting a bold remake", "You wanted Platinum's extras"] },
  "legends-arceus": {
    texto: ["Here, catching is the center of everything. You sneak through the tall grass, aim and throw the Poké Ball in real time, with no transition into battle. The Pokédex does not fill in when you catch one specimen: it asks for observation, repetition and field research.",
      "Hisui is divided into large open areas, covered on foot, by swimming and through the air, on mounts. There are bosses that demand dodging and reflexes. There are no gyms and no online battles: it is an exploration game from start to finish."],
    paraQuem: ["Always wanted to just explore and catch", "Are tired of the gym formula", "Like completing research lists"],
    naoSe: ["Trainer battles are what drives you", "You want traditional cities and routes"] },
  "scarlet-violet": {
    texto: ["Paldea is a single continuous map, with no closed routes. Three paths run in parallel, the gyms, the Titan Pokémon and Team Star, and you decide the order. When they meet, the final act surprises anyone who thought the series no longer cared about plot.",
      "There is a complete competitive scene, with raids, the Terastal phenomenon and up to four people exploring together. The launch had serious technical problems on the Switch; the free update for the Switch 2 improved performance a lot."],
    paraQuem: ["Want total freedom of route", "Want to explore with friends", "Want an adventure that also works as a base for competitive play"],
    naoSe: ["Technical stutters pull you out of the game, especially on the original Switch", "You prefer a guided adventure"],
    pokedexNota: "Kitakami and Blueberry are the two parts of the paid expansion." },
  "legends-z-a": {
    texto: ["The second Legends takes place entirely in Lumiose, the capital of Kalos, during a redevelopment plan that divides the city between people and Pokémon. By day, you explore the Wild Zones; by night, you climb from Z to A in a street tournament.",
      "Battles drop the turns: you move, dodge and fire off moves with a cooldown. Mega Evolution returns with brand-new forms."],
    paraQuem: ["Want to see Pokémon combat turn into action", "Played X and Y and miss Kalos", "Like a dense urban setting"],
    naoSe: ["You insist on turn-based battles", "A map that is only one city feels like too little for you"],
    pokedexNota: "Mega Dimension is the paid expansion." },
  "colosseum-xd": {
    texto: ["Orre is an arid region, with almost no Pokémon in the wild. Instead of catching in the grass, you use a machine to snatch Shadow Pokémon from other trainers' hands, in the middle of the fight, and then purify them.",
      "Almost every battle is a double battle, the tone is darker than usual and the opponents play seriously. Colosseum opens the story; XD, from 2005, continues it years later, with more species and a corrupted Lugia on the cover."],
    paraQuem: ["Want a Pokémon RPG with a different mood", "Like double battles", "Had a GameCube"],
    naoSe: ["You want to explore: here the world is small", "You miss catching freely"],
    semPokedex: "Orre has no regional Pokédex: the cast is the Shadow Pokémon snatched from opponents, and that list is not in the public database the atlas uses.",
    lugar: "Orre" },
  "mystery-dungeon-explorers-of-sky": {
    texto: ["No trainers here: you are a human who turned into a Pokémon, you join a guild of explorers and go down randomly generated dungeons, floor by floor, in turns. Hunger, limited items and rooms full of enemies punish anyone who gets careless.",
      "What stays with you, though, is the plot: a story about time and sacrifice that builds to an ending fans remember with reverence. Sky is the expanded edition of Explorers of Time and Explorers of Darkness, with extra episodes."],
    paraQuem: ["Put story above everything", "Like turn-based roguelikes", "Want to play in the role of the Pokémon"],
    naoSe: ["Repetitive dungeons tire you", "You want to catch and build a team the classic way"],
    semPokedex: "There is no Pokédex to fill here: Pokémon are recruited to the team, and the list of recruitable ones is not in the public database the atlas uses.",
    lugar: "a world of Pokémon only" },
  conquest: {
    texto: ["A crossover with Nobunaga's Ambition, Koei's strategy series. You command warriors, each linked to a Pokémon, in turn-based tactical battles on a board, taking the seventeen kingdoms of Ransei.",
      "Each Pokémon has a single move, which keeps matches lean and positioning decisive. After the main campaign, dozens of extra episodes put you in the place of other leaders."],
    paraQuem: ["Like grid tactics, in the style of Fire Emblem", "Want something outside the franchise's standard", "Enjoy long campaigns, with many scenarios"],
    naoSe: ["You want adventure and free exploration", "Turn-based strategy does not hold you"],
    lugar: "Ransei" },
  "pokemon-go": {
    texto: ["The game uses your phone's GPS to spread Pokémon across real streets, squares and parks. You walk to find them, spin PokéStops at points of interest and fight over gyms set in real places.",
      "Group raids, community days and city events have kept the game active since 2016. It is free, with optional purchases, and works best in urban areas, where there are more points nearby."],
    paraQuem: ["Want a reason to walk", "Like playing in a group, out on the street", "Remember the first generations and want something casual"],
    naoSe: ["You live far from busy areas", "You want an adventure with a beginning, a middle and an end"],
    semPokedex: "The roster grows with every event. Any list published here would be out of date within weeks.",
    lugar: "the real world" },
  "pokken-tournament-dx": {
    texto: ["Instead of picking commands from a menu, you control the Pokémon directly: strike, grab and counter in a rock-paper-scissors system. The fight alternates between an open arena phase and a side-on duel phase.",
      "The DX edition gathers the arcade and Wii U roster and adds fighters. It is easy to learn and has depth for anyone who wants to commit to online play."],
    paraQuem: ["Like fighting games", "Want quick matches against friends", "Want to see Pokémon fight without turns"],
    naoSe: ["You are after adventure, catching or story", "You have no patience for practicing execution"],
    semPokedex: "These are fighters and support Pokémon, not a Pokédex, and the list is not in the public database the atlas uses.",
    lugar: "Ferrum" },
  "mystery-dungeon-rescue-team-dx": {
    texto: ["A remake of Red Rescue Team and Blue Rescue Team, from 2005. A personality test suggests which Pokémon you will be; from there, you put together a rescue team and answer calls for help in random dungeons.",
      "The look imitates pencil and watercolor, and the new version adds comfort: an automatic exploration mode, Mega Evolution and bigger teams. It is the friendliest way into the dungeon series."],
    paraQuem: ["Want to try a roguelike without suffering", "Like simple, sincere stories of friendship", "Played the original on the GBA or the DS"],
    naoSe: ["You are looking for a plot as strong as Explorers of Sky's", "Repeating dungeons bothers you"],
    semPokedex: "There is no Pokédex to fill here: Pokémon are recruited to the team, and the list of recruitable ones is not in the public database the atlas uses.",
    lugar: "a world of Pokémon only" },
  "new-pokemon-snap": {
    texto: ["You travel along trails in a vehicle that moves on its own and photograph Pokémon in their environment. Each photo is scored for the pose, the size and the rarity of the behavior, and the fun is in finding out what triggers each scene.",
      "Throwing a fruit, playing a melody or coming back at night changes everything. The routes level up, reveal detours and hide behaviors nobody tells you about. It is the sequel to the Nintendo 64's Pokémon Snap, from 1999."],
    paraQuem: ["Just want to watch Pokémon living", "Like calm games, for short sessions", "Enjoy hunting for secrets and rare reactions"],
    naoSe: ["You want to control where you go", "You miss battling and leveling up a team"],
    semPokedex: "The game has its own Photodex, which is not in the public database the atlas uses.",
    lugar: "Lental" },
  "pokemon-unite": {
    texto: ["A team arena game. Each person controls one Pokémon in real time, defeats wild creatures to gather energy and deposits it in the opposing team's goals. Your Pokémon evolves and learns moves over the course of the match.",
      "There are defined roles, such as attacker, defender and supporter, and coordination counts more than reflexes. It is free, with in-game purchases, and works across Switch and mobile."],
    paraQuem: ["Like competing as a team", "Want short matches", "Already play other arena games"],
    naoSe: ["You want to play alone, at your own pace", "In-game purchases bother you"],
    semPokedex: "The playable roster changes every season. Any list published here would be out of date within weeks.",
    lugar: "Aeos Island" },
  "detective-pikachu-returns": {
    texto: ["An investigation adventure: you talk to people, Pikachu questions the Pokémon, and together you connect clues until each case is closed. There are no battles and no catching.",
      "It continues the story of the 3DS Detective Pikachu and finally answers what happened to Harry, the protagonist's father. The puzzles are simple and the pace is that of a cartoon: it works well for playing as a family."],
    paraQuem: ["Want a light story to follow", "Are playing with children", "Liked the film or the first game"],
    naoSe: ["You want the puzzles to challenge you", "You miss any kind of battle system"],
    semPokedex: "There is no Pokédex: the Pokémon appear as characters in the story.",
    lugar: "Ryme City" },
  "tcg-pocket": {
    texto: ["A pocket version of the trading card game. You open free packs every day, build a digital collection and admire illustrations that gain depth when you tilt the phone.",
      "Matches use lean rules: twenty-card decks and duels that are over in a few minutes. It is free, with optional purchases to open more packs."],
    paraQuem: ["Collected cards as a child", "Want something for two minutes a day", "Like collecting more than competing"],
    naoSe: ["You want the depth of the full card game", "Random draws with optional purchases bother you"],
    semPokedex: "Here you collect cards, not species, and new sets come out frequently." },
  pokopia: {
    texto: ["A life and building game. In the role of a Ditto with a human appearance, you plant, build and furnish an abandoned land to bring the Pokémon back. Each new resident teaches a move that works as a tool: watering, cutting, making things grow.",
      "There are no battles and no hurry. The game was developed by Game Freak with Koei Tecmo's Omega Force, and is exclusive to the Switch 2."],
    paraQuem: ["Like Animal Crossing and farming games", "Want to create at your own pace", "Prefer living alongside Pokémon to fighting with them"],
    naoSe: ["You want clear goals and a challenge", "You do not have a Switch 2 yet"],
    semPokedex: "The game's list of Pokémon is not yet in the public database the atlas uses.",
    lugar: "the ruins of Kanto" },
  champions: {
    texto: ["Champions isolates the battling part of the series and turns it into a game of its own, in the line of the old Pokémon Stadium. There is no adventure: you build teams, enter casual, ranked or private matches and climb the ladder.",
      "It connects to Pokémon HOME, which lets you bring Pokémon from other games, and puts Switch and mobile in the same match. Mega Evolution is back in the competitive format."],
    paraQuem: ["Want to compete without going through a campaign", "Already have Pokémon stored in HOME", "Follow tournaments"],
    naoSe: ["You want to explore or follow a story", "You are still learning the basics of battling"],
    pokedexNota: "Roster recorded in the public database in October 2026, with each species' national number. The game gets new species through updates." }
};
