/* Os desafios do atlas em inglês: o mesmo de dados/desafios.mjs, só o texto. Cada desafio entra pelo slug, com
 * os blocos e os itens na mesma ordem do original; as peças da roleta entram na mesma ordem das listas de lá.
 * O build confere se os dois arquivos têm a mesma forma. */

export const APRESENTACAO_EN = {
  pokemon: [
    "Pokémon does not have to end when you beat the Elite Four for the first time.",
    "PokéAtlas challenges are alternative ways to play each region of the franchise, which turn a campaign you know into a new adventure. They range from the strategic and hard to the completely chaotic, funny and absurd. Some have simple rules. Others have small stories, characters, restrictions and special win or loss conditions.",
    "The idea is not to find the most efficient way to play. It is to create a story you will remember."
  ],
  cobblemon: [
    "In Cobblemon there is no League to beat and no credits to watch. The world is open, and what to do with it is your choice.",
    "These challenges hand you that choice ready-made: a way to start a new world with one rule that changes everything, from the first block broken to the last Pokémon in the team.",
    "They work for a single player or for a whole server. The more people following the same rule, the better the story."
  ]
};

export const DESAFIOS_EN = {
  "os-super-woopers": {
    nome: "The Super Woopers", tema: "Family, bad luck, loyalty and a lot of Woopers.",
    sinopse: [
      "You were never exactly the Professor's favorite student.",
      "When the big day came, your friends got their starter Pokémon and set off on their journeys. You were left with none. No Chikorita. No Cyndaquil. No Totodile. Nothing.",
      "A few days later, while swimming alone in a lake near your town, you found a small family of Woopers. They were not strong. They were not rare. They were not exactly the kind of Pokémon anyone would picture facing the Elite Four.",
      "But they stayed with you. And when nobody else believed you could become a great trainer, six little Woopers did.",
      "Now there is only one thing to do: show all of Johto that picking you last was that professor's biggest mistake."
    ],
    objetivo: "Conquer Johto using only your family of Woopers.",
    blocos: [
      { titulo: "Forming the family", itens: [
        "The final team has five Quagsires and one Wooper.",
        "Start the adventure with a Wooper as soon as it is possible to get one. The starter the game forces you to take goes to the PC that day and never comes out again.",
        "Then catch the other five.",
        "One of the six has to be Shiny. If your version lets you get a Shiny Wooper early in a reasonable way, you can use it from the start. Otherwise, find it during the adventure."
      ] },
      { titulo: "The most important rule", texto: "Every Wooper gets a name. They are not six random Pokémon: they are a family. Feel free to give each one a personality, decide who is the oldest, who is the stubborn one and who will never evolve." }
    ],
    vitoria: "Enter the Hall of Fame with all six on the field: five Quagsires and the Wooper that stayed small.",
    derrota: "There is none. You do not abandon family: if you lose, you get up and try again.",
    variacao: "Without the Shiny, the challenge still counts and gets much shorter. With it, it is for those with the patience of a saint."
  },
  "a-heranca-do-magikarp": {
    nome: "The Five-Hundred Fish", tema: "Stubbornness, a bad deal and the will to prove it was a good one.",
    sinopse: [
      "At the Pokémon Center at the foot of Mt. Moon, a man with a wide smile offers an extremely rare Pokémon for just 500. Everyone warns you it is a scam.",
      "You buy it anyway.",
      "Inside the Poké Ball is a Magikarp that only knows how to flop around. The seller vanishes. Your friends laugh. And you decide, right there, that this fish is going to defeat the champion of Kanto."
    ],
    objetivo: "Make the Magikarp bought on Route 4 the hero of every important battle in Kanto.",
    blocos: [
      { titulo: "Rules", itens: [
        "Buy the Magikarp at the Pokémon Center on Route 4, before Mt. Moon. From then on, it never leaves the team.",
        "It is the one that has to take down the last Pokémon of every gym leader, of every Elite Four member and of the champion.",
        "No Rare Candy on it. Every level is earned in battle.",
        "It gets a nickname worthy of something that cost 500.",
        "The rest of the team is free, but it is there to serve as a ladder."
      ] },
      { titulo: "What to expect", texto: "Up to level 15 it only knows Splash, which does nothing. From 15 to 20 it has Tackle. At 20 it becomes Gyarados, and the joke is now yours." }
    ],
    vitoria: "The final blow on the champion comes from the five-hundred fish.",
    derrota: "If another Pokémon takes down a leader's last opponent, the badge does not count: lose the battle on purpose and redo it.",
    variacao: "Hard mode: it cannot evolve before the fourth badge."
  },
  "mare-alta": {
    nome: "High Tide", tema: "Salt, patience and a region that is half sea.",
    sinopse: [
      "They say Hoenn has too much water. You decided to agree.",
      "A fisherman's child, raised on the docks, you never understood why anyone would look for Pokémon in the tall grass when the whole sea is right there. Your fishing rod is old, your patience is long, and your team is going to smell of the sea."
    ],
    objetivo: "Beat the Hoenn League with only Pokémon taken from the water.",
    blocos: [
      { titulo: "Rules", itens: [
        "Only Pokémon that were fished, found while surfing or found while diving join the team.",
        "The starter is allowed until you get the Old Rod from the fisherman in Dewford Town. Once you fish the first one, the starter goes to the PC.",
        "Tall grass is for walking through, not for catching.",
        "Pokémon received as gifts or through in-game trades do not count."
      ] }
    ],
    vitoria: "Hall of Fame with a team in which everyone came from the water.",
    derrota: "Caught one on dry land out of reflex? Release it and move on. If you used it in battle, the next badge does not count.",
    variacao: "Hard mode: only what came off the fishing rod counts, no Surf."
  },
  "o-aprendiz-de-flint": {
    nome: "Flint's Apprentice", tema: "Fire in a cold land, and the art of making do with little.",
    sinopse: [
      "Flint is the Fire specialist of Sinnoh's Elite Four. In Diamond and Pearl, not even he manages to build an all-Fire team: he uses Steelix, Drifblim and Lopunny to fill it out.",
      "The reason is simple. In that Sinnoh's Pokédex there are only two Fire-type lines: Chimchar's and Ponyta's.",
      "You decided to be the apprentice who does what the master did not."
    ],
    objetivo: "Beat the Sinnoh League with an all-Fire team, in a region that has almost no Fire.",
    blocos: [
      { titulo: "Rules", itens: [
        "Only Fire-type Pokémon join the team.",
        "In Diamond and Pearl, that means two lines: Chimchar and Ponyta. Pick Chimchar at the start or the challenge ends right there.",
        "You can repeat a species: six Rapidashes is a valid team, and a nightmare.",
        "Pokémon of other types only to use HMs, never in battle."
      ] },
      { titulo: "Which game to use", texto: "Diamond and Pearl are the pure challenge. Platinum adds a few Fire options to the regional Pokédex, and Brilliant Diamond and Shining Pearl open up even more in the Grand Underground: use them if you want room to breathe." }
    ],
    vitoria: "Defeat Flint, the rest of the Elite and the champion with a team in which everyone is Fire type.",
    derrota: "Used a non-Fire Pokémon in battle: go back to the last gym you beat.",
    variacao: "Hard mode: Diamond or Pearl, a team of four at most."
  },
  "como-n": {
    nome: "Like N", tema: "Letting go, conviction and a goodbye in every city.",
    sinopse: [
      "N believes Pokémon should not live bound to trainers. So, in every city where you face each other, he fights with Pokémon he found nearby, and then lets them go.",
      "You met him in Accumula Town and could never forget what you heard.",
      "So you made a deal with yourself: you will go all the way to the end of the League, but his way."
    ],
    objetivo: "Reach the end of Unova without ever keeping a team for more than one badge.",
    blocos: [
      { titulo: "Rules", itens: [
        "For each gym, the team can only have Pokémon caught on the routes and areas between the previous gym's city and this one.",
        "Won the badge? Say goodbye: the whole team is released before you leave the city.",
        "The starter follows the same rule and stays behind after the first gym.",
        "For the Elite Four, what you catch on Route 10 and in Victory Road is allowed."
      ] },
      { titulo: "What this changes", texto: "You never have a high-level team. Every gym becomes a puzzle of putting together, in a few hours, six local Pokémon that can handle the leader." }
    ],
    vitoria: "Defeat N and Ghetsis with a team caught in the final stretch.",
    derrota: "Took a Pokémon from one stretch into the next: release it and redo the last gym.",
    variacao: "Light version: instead of releasing, store it in the PC and never use it again."
  },
  "passarela-de-lumiose": {
    nome: "Lumiose Runway", tema: "Fashion, vanity and a team that matches the outfit.",
    sinopse: [
      "In Kalos, style is serious business. There are boutiques in almost every city, and the most famous one in Lumiose will not even let you in until you are somebody.",
      "You did not come to collect badges. You came to launch a collection.",
      "And a self-respecting collection has a single color."
    ],
    objetivo: "Beat the Kalos League with a single-color team, dressed to match.",
    blocos: [
      { titulo: "Rules", itens: [
        "Pick a color. Every Pokémon in the team has to be that color in the Pokédex (each species page in the atlas shows which one it is).",
        "Your character's outfit goes along: from head to toe, in the collection's color.",
        "With each badge, buy a new piece before traveling on. If money is short, the trip waits.",
        "Mega Evolution is only allowed if the mega form still matches."
      ] }
    ],
    vitoria: "Hall of Fame with six Pokémon of the same color and a matching trainer photo.",
    derrota: "Entered a gym battle with someone off-palette: the critics do not forgive, redo the gym.",
    variacao: "Not sure which color to pick? The roulette below draws one for you."
  },
  "para-sempre-pequenos": {
    nome: "Forever Small", tema: "Childhood, stubbornness and nobody in a hurry to grow up.",
    sinopse: [
      "In Alola nobody is in a hurry. The island trials are not a race, the sun takes its time to set and everyone calls you cousin.",
      "Your starter looked at you on the first day, small as it was, and you made a silly promise: it did not need to change to be a champion.",
      "A promise is a promise."
    ],
    objetivo: "Complete the island challenge and beat the League without any Pokémon evolving.",
    blocos: [
      { titulo: "Rules", itens: [
        "No Pokémon in the team may evolve. Cancel every evolution, always.",
        "Only Pokémon that could still evolve join the team. Those that never evolve are left out.",
        "Caught one already evolved? It goes to the PC.",
        "Items are free. If you find something that favors the unevolved, use it without guilt."
      ] },
      { titulo: "Where it hurts", texto: "Totem Pokémon call for backup and have boosted stats. Against a team of little ones, every trial asks for a plan, not strength." }
    ],
    vitoria: "Become champion of Alola with six Pokémon in their first stage.",
    derrota: "An evolution slipped through by accident: that Pokémon retires to the PC.",
    variacao: "Hard mode: a team of babies and first stages, with no items in battle."
  },
  "cartao-vermelho": {
    nome: "Red Card", tema: "Football, a short squad and fear of suspension.",
    sinopse: [
      "In Galar, a gym battle is a game in a packed stadium. There is a crowd, there is a uniform, and you even choose your shirt number.",
      "So take it seriously. A team has a squad, a squad has a limit, and whoever misbehaves on the field gets carded.",
      "The season is long. Rest your starters."
    ],
    objetivo: "Win Galar's Champion Cup with a closed squad, under football rules.",
    blocos: [
      { titulo: "Rules", itens: [
        "Your squad has eleven: six starters and five substitutes. Once the eleven are set, nobody else comes in until the end.",
        "A Pokémon that faints gets a yellow card.",
        "A second yellow is a red: sent off from the squad, it goes to the PC and does not come back.",
        "Before each gym, announce the lineup. During the match, only the six in the lineup play.",
        "Every player has a number. Put it in the nickname."
      ] }
    ],
    vitoria: "Defeat the champion with at least six players still in the squad.",
    derrota: "Left with fewer than six: the club went bankrupt, the season is over.",
    variacao: "Hard mode: a straight red card for anyone who faints in a gym battle."
  },
  "o-pesquisador-pacifista": {
    nome: "The Pacifist Researcher", tema: "Silence, tall grass and no fighting.",
    sinopse: [
      "You fell from the sky into a land that is afraid of Pokémon. Professor Laventon asks for one thing only: observe.",
      "Everyone in the village takes that to mean 'fight until they obey'. You took it literally.",
      "Your Pokédex is going to be written with patience, fruit and good aim."
    ],
    objetivo: "Reach the credits of Legends: Arceus without ever starting a battle against a wild Pokémon.",
    blocos: [
      { titulo: "Rules", itens: [
        "You never throw one of your Pokémon at a wild one to start a battle.",
        "Catch only with a Poké Ball thrown while unseen, or after distracting with food.",
        "If a wild one attacks first, run. Battling to defend yourself is the last resort.",
        "Battles the story forces on you are allowed.",
        "Research tasks that require defeating Pokémon stay blank, and that is fine."
      ] }
    ],
    vitoria: "See the credits with a clear conscience.",
    derrota: "Started a battle on impulse: return one Pokémon from your team to the wild.",
    variacao: "Hard mode: never be seen by an alpha."
  },
  "rota-do-avesso": {
    nome: "The Wrong Way Round", tema: "The wrong order, on purpose.",
    sinopse: [
      "On the first day of school, the director says Paldea is yours and that you can go wherever you want, in whatever order you want.",
      "He did not expect anyone to take that so seriously.",
      "The levels of your opponents in Paldea do not adjust to yours. There is a sensible order for everything. You are going to do the other one."
    ],
    objetivo: "Complete Paldea's three stories starting with what is hardest.",
    blocos: [
      { titulo: "Rules", itens: [
        "In each of the three paths (gyms, Titans and Team Star), face the opponents from the highest level to the lowest.",
        "The first gym is Glaseado's, at the top of the icy mountain.",
        "Training until you are above the opponent is not allowed: your team's level is capped at that of the strongest Pokémon you have already defeated in an important battle.",
        "Pokémon from raids with friends are left out."
      ] },
      { titulo: "What happens", texto: "The beginning is brutal and the end turns into a stroll. The fun is in the first ten hours, when every win seems impossible." }
    ],
    vitoria: "Finish the three paths in reverse order and see the final act.",
    derrota: "Beat an opponent out of order: lose on purpose to the next one in line before continuing.",
    variacao: "Hard mode: no switching Pokémon during important battles."
  },
  "um-bioma-so": {
    nome: "One Biome Only", tema: "Roots: the world is huge and you are from here.",
    sinopse: [
      "The world generated, you opened your eyes, and the place where your feet touched the ground became your land.",
      "You can travel as much as you want. You can see oceans, deserts and the Nether. But your team is from the place where you were born, and from no other."
    ],
    objetivo: "Build a full team with only Pokémon that spawn in the biome where you appeared.",
    blocos: [
      { titulo: "Rules", itens: [
        "Write down the biome of the spot where the world began. That is your biome.",
        "Only Pokémon caught in it join the team. Each species page in the atlas shows where it spawns.",
        "Other Pokémon can be caught for the Pokédex, but they go straight to the PC.",
        "Evolutions count, even if the evolved form does not spawn there."
      ] }
    ],
    vitoria: "Six Pokémon from your biome in the team, all above level 50.",
    derrota: "Used an outsider in battle: release it where you found it.",
    variacao: "Started in the middle of the ocean? Tough luck. That is the real challenge."
  },
  "vida-de-minerador": {
    nome: "A Miner's Life", tema: "Darkness, a pickaxe and missing the sun.",
    sinopse: [
      "You dug straight down in the first minute, like everyone does. The difference is that the tunnel caved in behind you.",
      "Down there is ore, there is lava, and there are Pokémon that have never seen the sky. They are going to be your team.",
      "The surface can wait. A long while."
    ],
    objetivo: "Build a team of six without going back to the surface.",
    blocos: [
      { titulo: "Rules", itens: [
        "After the first night, go down and do not come back up.",
        "Catching only counts where there is no sky in sight: caves, mines, lush caves, deep dark.",
        "Wood, food and Apricorns have to come from below. Plant what you managed to bring.",
        "You can only see the sun again with six Pokémon in the team."
      ] }
    ],
    vitoria: "Leave the cave, in daylight, with a full team of underground dwellers.",
    derrota: "Went up before your time: the team is released at the mouth of the cave and you go down again.",
    variacao: "Hard mode: a world in Hardcore mode."
  },
  "linha-na-agua": {
    nome: "Line in the Water", tema: "Patience, a little stool and a Poké Rod.",
    sinopse: [
      "Some people chase after Pokémon. You would rather wait for them to come.",
      "A Poké Rod, a lake, the whole day ahead. Whatever bites joins the team. Whatever does not, was not meant to be."
    ],
    objetivo: "Build the whole team with the Poké Rod.",
    blocos: [
      { titulo: "Rules", itens: [
        "Your first goal in the world is to craft a Poké Rod.",
        "Only Pokémon hooked with it join the team. The starter goes to the PC on the first catch.",
        "Enchanting the rod with Lure is allowed, and recommended: some species only bite that way.",
        "Change waters: river, swamp, cold ocean and warm ocean give different fish."
      ] }
    ],
    vitoria: "Six fished Pokémon, from at least four different waters.",
    derrota: "Caught one on land and used it in battle: one in-game week without fishing, as punishment.",
    variacao: "Hard mode: fishing only counts from inside a boat."
  },
  "bolota-por-bolota": {
    nome: "Apricorn by Apricorn", tema: "Farming, craft and no free Poké Balls.",
    sinopse: [
      "In Cobblemon, a Poké Ball is not bought: it is crafted, from Apricorns picked off the tree.",
      "You decided to do it properly. An orchard, seven colors, and every ball in your team with a story: which tree it came from, what day it was picked."
    ],
    objetivo: "Catch a full team using only Poké Balls made from Apricorns from your own orchard.",
    blocos: [
      { titulo: "Rules", itens: [
        "Every Poké Ball you throw has to have been crafted by you.",
        "The Apricorns come from trees you planted. The ones you find around the world only serve as seedlings.",
        "Balls found in chests, fished up or received from other players cannot be used.",
        "Each Pokémon in the team has to be in a different kind of ball."
      ] }
    ],
    vitoria: "Six Pokémon, six kinds of Poké Ball, all from your orchard.",
    derrota: "Threw a ball you did not make: the Pokémon caught with it is released.",
    variacao: "Hard mode: plant all seven Apricorn colors before the first catch."
  },
  "a-cavalaria": {
    nome: "The Cavalry", tema: "Loose reins, wind in your face and not a step on foot.",
    sinopse: [
      "Ever since Pokémon started accepting riders, walking became a thing of the past.",
      "You took a slightly ridiculous oath: from today on, your feet only touch the ground to mount, mine and sleep. Travel is on a mount only. By land, by water and by air."
    ],
    objetivo: "Cross the world, from the starting point to The End, without traveling on foot.",
    blocos: [
      { titulo: "Rules", itens: [
        "After getting your first mount, you no longer move on foot for more than a hundred blocks.",
        "The team needs at least one land mount, one water mount and one air mount.",
        "Horses, boats, rails and elytra are forbidden. A mount is a Pokémon.",
        "Inside caves and buildings, walk freely."
      ] }
    ],
    vitoria: "Reach The End having used all three mounts along the way.",
    derrota: "Traveled on foot: ride back to where you dismounted and redo the stretch.",
    variacao: "Hard mode: a single species of mount for the whole challenge."
  }
};

/* As peças da roleta, na mesma ordem das listas de dados/desafios.mjs. As chaves entre chaves são as mesmas. */
export const ROLETA_EN = {
  pokemon: {
    regras: [
      { texto: "Only {tipo}-type Pokémon join the team.", titulo: "All {tipo} in {regiao}" },
      { texto: "Only Pokémon that are {cor} in the Pokédex join the team.", titulo: "{regiao} in {cor}" },
      { texto: "{especie} is the captain: it never leaves the team and has to be on the field at the end of every gym battle.", titulo: "{especie}, captain of {regiao}" },
      { texto: "Your team is this one, and only this one: {seis}.", titulo: "The six of {regiao}" },
      { texto: "Nobody evolves. Cancel every evolution.", titulo: "The little ones of {regiao}" },
      { texto: "Only the first Pokémon to appear on each route counts, and whoever faints stays behind.", titulo: "{regiao} Nuzlocke" },
      { texto: "Only Pokémon whose name starts with the letter {letra} join the team.", titulo: "{regiao} with the letter {letra}" }
    ],
    complicacoes: [
      "No healing items during battles.",
      "Pokémon Center only once per city.",
      "Everyone gets a nickname, all on the same theme: {tema}.",
      "Battle style on Set: no switching Pokémon after a knockout.",
      "Nobody in the team may go above the level of the next leader's strongest Pokémon.",
      "The starter goes to the PC after the first badge.",
      "Each Pokémon can only have one move that deals damage.",
      "No running from battles against wild Pokémon.",
      "After the second badge, no bought Poké Balls: only the ones you find.",
      "A team of four at most.",
      "Every gym battle starts with the lowest-level Pokémon in the team.",
      "No two Pokémon in the team can share a type."
    ],
    temas: ["fairground foods", "distant relatives", "planets and moons", "soap opera villains", "football teams", "names of medicines", "old cartoon characters", "desserts"],
    vitorias: [
      "Enter the Hall of Fame.",
      "Enter the Hall of Fame with at most ten knockouts suffered in the whole game.",
      "Enter the Hall of Fame without losing any gym battle.",
      "Defeat the champion without using any item in the final battle.",
      "Enter the Hall of Fame with all six Pokémon at the same level.",
      "Enter the Hall of Fame before the game clock reaches twenty hours."
    ],
    derrotas: [
      "Lost a gym battle: go back and redo the previous gym.",
      "Everyone fainted: the highest-level Pokémon goes to the PC forever.",
      "Everyone fainted: game over, start another draw.",
      "Broke a rule: choose one Pokémon in the team to release.",
      "Lost: change the nickname of the whole team to the name of whoever beat you."
    ]
  },
  cobblemon: {
    regras: [
      { texto: "Only Pokémon caught {emAmbiente} join the team. There are {quantos} possible species, such as {exemplos}.", titulo: "Children {doAmbiente}" },
      { texto: "{especie} is the captain of the team. Find one {emAmbiente} before catching any other.", titulo: "Looking for {especie}" },
      { texto: "Only Pokémon hooked with the Poké Rod join the team.", titulo: "Only what takes the bait" },
      { texto: "Only {tipo}-type Pokémon join the team.", titulo: "{tipo} world" },
      { texto: "Only Pokémon you caught as an alpha join the team.", titulo: "Alphas only" },
      { texto: "Only Pokémon that can be ridden join the team.", titulo: "A team of mounts" }
    ],
    complicacoes: [
      "No Healing Machine: the team recovers with berries and medicine.",
      "Only Poké Balls crafted by you, from Apricorns from your orchard.",
      "A world in Hardcore mode.",
      "No trading with villagers.",
      "No sleeping: every night is spent awake, exploring.",
      "You only eat what your Pokémon drop or what you planted.",
      "Your base has to be in the hardest biome you find in the first hour.",
      "Each Pokémon in the team lives in a house of its own, built by you.",
      "No armor allowed. Your team is what protects you."
    ],
    temas: [],
    vitorias: [
      "A team of six, all above level 50.",
      "Reach The End taking the whole team.",
      "Register a hundred species in the Pokédex.",
      "Revive the fifteen fossil Pokémon in the mod.",
      "Catch an ultra-rare Pokémon from the environment that was drawn.",
      "Have a land mount, a water mount and an air mount in the team."
    ],
    derrotas: [
      "You died: the highest-level Pokémon is released where you fell.",
      "Broke a rule: tear down your base and start again in another biome.",
      "You died: the whole team goes to the PC and you start again with the starter.",
      "Broke a rule: spend a whole in-game day without catching anything."
    ]
  }
};
