# 🗺️ PokéAtlas

<p align="center"><a href="README.md">Português</a> · <strong>English</strong></p>

<p align="center">
  <strong>A visual guide to find out which Pokémon game suits you.</strong>
</p>

<p align="center">
  <a href="https://pokeatlas-eight.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Open%20Pok%C3%A9Atlas-pokeatlas--eight.vercel.app-2ea44f?style=for-the-badge&logo=vercel&logoColor=white" alt="Live site on Vercel" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Online-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/Node.js-%3E%3D20-informational?style=flat-square&logo=node.js" alt="Node version" />
  <img src="https://img.shields.io/badge/Framework-Zero%20Dependencies%20(Vanilla)-f5a623?style=flat-square" alt="No framework" />
  <img src="https://img.shields.io/badge/Generated%20Pages-1%2C988%20static-blue?style=flat-square" alt="Pages" />
  <img src="https://img.shields.io/badge/Data-Pok%C3%A9API-red?style=flat-square" alt="PokéAPI" />
  <img src="https://img.shields.io/badge/Kind-Fan%20Project%20(Unofficial)-lightgrey?style=flat-square" alt="Unofficial" />
  <img src="https://img.shields.io/badge/License-MIT%20(code)-green?style=flat-square" alt="MIT License" />
</p>

> The home page and the compass are available in English at [`/en/`](https://pokeatlas-eight.vercel.app/en/). The rest of the site is in Brazilian Portuguese.

<p align="center">
  <img src="docs/imagens/inicio.webp" alt="The home page: a game's entry, with the attribute hexagon and the blue profile keypad" width="49%" />
  <img src="docs/imagens/pico.webp" alt="The scene where the hexagon answers each request, with the thirty profiles around it" width="49%" />
</p>
<p align="center">
  <img src="docs/imagens/bussola.webp" alt="The compass: a question with four answers and the visitor's profile" width="49%" />
  <img src="docs/imagens/time.webp" alt="The team builder, laid out like the games' party screen" width="49%" />
</p>
<p align="center">
  <img src="docs/imagens/regiao.webp" alt="The map of Kanto, with numbered routes and cities" width="49%" />
  <img src="docs/imagens/cobblemon.webp" alt="The Cobblemon edition: Wooper's page, with the mod's model" width="49%" />
</p>

---

## 📌 Contents

- [About](#-about)
- [The Signature: A Living Hexagon](#-the-signature-a-living-hexagon)
- [Main Features](#-main-features)
- [Art Direction](#-art-direction)
- [Architecture and Engineering](#-architecture-and-engineering)
- [Repository Layout](#-repository-layout)
- [Running Locally](#-running-locally)
- [Scripts](#-scripts)
- [Deploy](#-deploy)
- [Legal Notices and Credits](#-legal-notices-and-credits)
- [Author](#-author)

---

## 🧭 About

**PokéAtlas** is an interactive, editorial site made for three kinds of players:
1. **The nostalgic one**, who stopped a few generations ago and wants a way back in;
2. **The newcomer**, who does not know where to start among dozens of titles;
3. **The veteran fan**, looking for a new way to look at the games.

It is not an encyclopedic wiki and it is not a storefront. PokéAtlas is built as a **Pokédex device**: the red body, the blue lens, the three lights, the screen where everything happens, and the keys. Every game gets its own profile, a six-attribute hexagon like the one on the games' summary screens, which turns what the game offers into a shape.

🔗 **Live site:** [https://pokeatlas-eight.vercel.app/](https://pokeatlas-eight.vercel.app/)

---

## 🔶 The Signature: A Living Hexagon

Each title is described by six gameplay attributes:

| Axis | What it measures |
| :--- | :--- |
| **Story** | Depth of the narrative, characters and lore. |
| **Exploration** | Routes, secrets, biomes and detours off the main path. |
| **Difficulty** | How demanding the gyms, the AI and the key battles are. |
| **Freedom** | How much you choose the order of goals and where to go. |
| **Competitive** | Post-game mechanics, breeding, EVs/IVs and tactical depth. |
| **Nostalgia** | Emotional memory, period look and historical weight. |

### How the hexagon is drawn
Each attribute is a vertex in a fixed direction. Scores from 1 to 5 pull the vertex:
- The higher the score, the farther from the center the vertex goes.
- The shape that is left is the **game's profile**: two similar games have outlines that match.
- It is drawn as **SVG at build time** and as a **live Canvas** in the browser, where the profile stretches from one shape to the next instead of jumping.

The scores are the atlas's own editorial reading, not official data.

---

## 🗺️ Main Features

### 1. 🧭 Compass (recommendation quiz) (`/bussola/`)
Eight questions. As the visitor answers, the hexagon of their profile is drawn live. At the end, the algorithm compares that shape with every game in the catalog and recommends the closest ones, explaining on which vertices they match.

### 2. 📖 Engraved Pokédex (`/pokedex/` and `/pokedex/<species>/`)
- **1,025 Pokémon species.**
- Art shown as a **single-color engraving**, like a monochrome screen, which gets its official colors back on hover or focus; types appear as badges in the colors the games use.
- Instant search and filters by generation and type.
- A page per species with base stats, size, full evolution line, special forms and the games it appears in.
- **Special forms:** Mega Evolutions, Gigantamax, regional forms and other forms that change types or stats.
- **Computed trivia:** facts produced at build time by cross-checking the data (unique type combinations, weight and size outliers and so on), with no invented text.

### 3. 🗺️ Region Maps (`/regioes/` and `/regioes/<region>/`)
- Redrawn vector maps of the 10 regions: **Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Hisui and Paldea**.
- Coastline, elevation, numbered cities and landmarks.
- Routes with **two-way highlighting**: hovering a route in the list lights it on the map, and the other way around.
- Maps draw themselves when they enter the viewport.

### 4. ⚖️ Profile Comparison (`/comparar/`)
Pick up to 3 games and overlay their hexagons in three colors (those of the first partners: water, fire and grass) to see, point by point, where they differ.

### 5. ⏳ Franchise Timeline (`/linha-do-tempo/`)
A ruler from **1996 to 2027**, split by console, which also works as the full index of the games covered.

### 6. 🎲 Challenges (`/desafios/`)
- **Ten alternative ways to play**, one per region, each with a synopsis, rules, and win and loss conditions.
- **Challenge journal** (`/diario/`): tracks a run (a Nuzlocke, one of the atlas's challenges or your own rules), with catches per route, team, box, fallen Pokémon and badges. For 12 games it lists what appears on each route, from PokéAPI's encounter tables. It is stored in the browser and exports to a file.
- **Challenge roulette:** draws a game, a team rule, complications and a win condition. Every draw has its own link, which reproduces the same challenge.

### 7. ⛏️ Cobblemon Edition (`/cobblemon/`)
A second edition of the atlas, about the [Cobblemon](https://cobblemon.com/) mod for Minecraft, chosen in the selector at the top. It has its own theme (map parchment, inventory panels, pixel type) and draws the Pokémon from the mod's own models.
- **Code:** the source code in this repository is under the [MIT License](LICENSE). It does not cover the third-party material listed below.
- **Pokémon:** the 888 implemented species, with the biomes where they spawn, rarity, conditions, drops, mounts and evolutions inside the mod. **Rotate in 3D** swaps the portrait for the mod's model (zoom and fullscreen), and **Shiny** swaps the texture.
- **Items:** 490 items and blocks, with icon, recipes drawn as in the game (crafting table, campfire pot, brewing stand, furnace, smithing), who drops each one and, for berries, the pairs that produce them by mutation.
- **Structures:** the 65 structures the mod generates, as 3D block models with zoom.
- **Biomes:** 11 environments as rotating 3D dioramas, with their species and structures.
- **Hunt plan:** mark the Pokémon you want and the atlas tells you in which biome you can find most of them at once.
- **Challenges:** five challenges to start a new world, plus the roulette.
- All data is extracted from the files of version **1.8.1** of the mod by `scripts/cobblemon.mjs`.

### 8. 🧰 Trainer Tools
- **Team builder** (`/time/`): up to six Pokémon, laid out like the games' party screen. Each slot shows the Pokémon's types and what it takes 4× or 2× damage from, what it resists and what it is immune to; below, the team reading in type badges (holes, types with no answer, what the team is weak to and what it covers). Filters by each game's Pokédex, and the team lives in the URL.
- **Compare Pokémon** (`/comparar/pokemon/`): base stats of two Pokémon side by side.
- **Global search:** the **Buscar** button and the `/` and `Ctrl+K` shortcuts find games, regions, Pokémon, challenges, items, structures and biomes from any page.

### 9. 🎬 Scroll-driven Home (`/`)
A continuous journey in 6 scenes:
1. *The device turns on:* the screen's shutters open on the hexagon of a game, like a Pokédex entry; the blue keypad swaps the profile shown.
2. *The regions:* a horizontal rail of the 10 regions, each on a card with its map and starters.
3. *Thirty years:* numbers in dot-matrix type and a ruler of years.
4. *The hexagon answers (the peak):* the screen goes dark; each request pulls a vertex, the hexagon takes the shape of the chosen game and, around it, the profiles of the games that go far in that direction light up.
5. *The tools:* the Pokédex and the comparison.
6. *Your profile:* the whole screen in yellow and the invitation to open the compass.

### 10. 🔊 Sound
The atlas opens silent. The speaker button in the header opens a small panel with the switch that turns sound on and one volume for the music and another for the key sounds; the choices are stored in the browser.
- **Background music:** one tune per edition, composed for the atlas and played live by the browser (Web Audio), with no audio file. Square waves like a handheld in the Pokémon edition; long, loose notes with echo in the Cobblemon edition.
- **Key sounds:** device beeps in the Pokémon edition and a block-menu click in the Cobblemon edition.
- **Cries:** each species page, in both editions, has a **Ouvir o grito** ("hear the cry") button that plays the Pokémon's cry from the games. This one works even with the atlas sound off.

### 11. 🌍 English version (`/en/` and `/en/compass/`)
The home page and the compass also exist in English, with the axis names, each game's tagline and notes, the region blurbs and the eight questions translated. The other sections are in Portuguese only, and the English pages say so on the links that lead to them.

### 12. 📲 Install and share
- **Install on a phone:** the atlas has a manifest and icons and can be added to the home screen like an app.
- **Link preview:** every page carries the image shown when its address is pasted into a social network or a chat.
- **Sitemap:** `sitemap.xml` and `robots.txt` are generated at build time, with every page.

---

## 🎨 Art Direction

| Element | Implementation | Inspiration |
| :--- | :--- | :--- |
| **Device body** | `#DC0A2D` (Pokédex red) on the page background, header and footer | The Pokédex from the games and the show |
| **Screen** | `#F1F5EA` (lit, with a dot grid) and `#171A21` (dark) | LCD screens of the handhelds |
| **Main ink** | `#20232B` (graphite) for text, borders and hard shadows | The games' text boxes and menus |
| **Accents** | `#FFCB05` (keys and hexagon) and `#29AAFD` (the lens) | The logo and the device's lens |
| **Scores and types** | A health-bar ramp from red to green for scores; the 18 type colors on badges | HP bars and type badges |
| **Typography** | **M PLUS Rounded 1c** (headings and text) + **DotGothic16** (numbers and screen readouts) | Rounded signage and dot-matrix type |

The Cobblemon edition has its own direction (map parchment, inventory panels, **Pixelify Sans**, **Archivo** and **Alegreya**) in `src/estilo.css`.

---

## ⚡ Architecture and Engineering

- **Zero production dependencies:** no React, Vue, Next.js or Tailwind. The whole site runs on semantic HTML, modern CSS and vanilla JavaScript (ES modules).
- **Custom static site generator:** `scripts/build.mjs` validates the data model and writes **1,988 static HTML pages in about one second**.
- **3D without a library:** structure and biome models and Pokémon models rotate in the project's own viewer (`src/js/visor.js`), with WebGL and, where the browser does not provide it, a software renderer.
- **Music without audio files:** the soundtrack and effects are scores written as text (`src/js/som-logica.js`) and played with oscillators; only the Pokémon cries are files.
- **Own scroll engine:** entrances, pinned scenes and horizontal rails are driven by `src/js/rolagem.js`, and everything falls back to plain sections under reduced motion.
- **Two languages without duplicating pages:** the page frame, the home and the compass take the language as a parameter; the phrases live in `scripts/textos.mjs` and the content translations in `dados/en.mjs`, and the build fails if a translation falls behind.
- **Tests:** the rules of each tool live in pure modules (`src/js/*-logica.js`) tested with `node:test`; browser scripts in `testes/navegador/` check each page with Playwright.
- **Strict build validation:** the build checks every route, score, Pokédex reference and map before writing the output folder.

---

## 📂 Repository Layout

```bash
Projeto-Vitrine-Jogos/
├── dados/          # Canonical content: games, regions, challenges, Pokédex, Cobblemon data
├── scripts/        # The static site generator, page templates and data/art pipelines
├── src/
│   ├── pokedex.css # Stylesheet of the Pokémon edition (the Pokédex device)
│   ├── estilo.css  # Stylesheet of the Cobblemon edition (the block map)
│   ├── js/         # Client-side modules: one per page, plus hexagon, viewer, scroll and sound
│   ├── fontes/     # Fonts (SIL OFL)
│   ├── arte/       # Engravings, drawn models, icons
│   ├── gritos/     # One cry per species (.ogg)
│   ├── maquetes/   # Block data for the 3D structure and biome models
│   └── modelos3d/  # Model and texture of each Cobblemon Pokémon
├── testes/         # Unit tests (node:test) and browser scripts
├── docs/           # Implementation plan, outreach text and screenshots
├── LICENSE         # MIT for the code, with a note on third-party material
├── BRIEF.md        # Art direction and content decisions, round by round (Portuguese)
└── vercel.json     # Routing and deploy configuration
```

---

## 💻 Running Locally

Requires **Node.js 20+**. The build does **not** need `npm install`.

```bash
git clone https://github.com/Avendanho/Projeto-Vitrine-Jogos.git
cd Projeto-Vitrine-Jogos
npm run dev        # builds into dist/ and serves http://localhost:4600
```

```bash
npm run build             # production build only
npm test                  # unit tests, no browser and no dependencies
npm install               # only for the browser scripts and the art pipelines
npm run test:navegador    # with `npm run dev` running in another terminal
```

---

## 🛠️ Scripts

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Builds the site into `dist/` and serves it at `http://localhost:4600`. |
| `npm run build` | Validates the data and writes all 1,988 pages. |
| `npm test` | Unit tests of the rules (team, journal, hunt, search, models, sound, data). |
| `npm run test:navegador` | Browser scripts for every tool (needs `npm run dev` running). |
| `npm run verificar` | Visual audit: scrolls each page on desktop, phone and reduced motion and takes screenshots. |
| `npm run pokedex`, `tipos`, `encontros` | *(Data)* Rebuild species, type chart and route encounters from PokéAPI. |
| `npm run gritos` | *(Sound)* Downloads each species' cry into `src/gritos/`. |
| `npm run vitrine` | *(Outreach)* Rebuilds the install icons, the link preview images and the README screenshots (needs `npm run dev` running). |
| `npm run arte`, `arte:mini`, `arte:formas`, `cartas` | *(Art)* Engravings and region maps. |
| `npm run mod`, `cobblemon`, `modelos`, `itens`, `maquetes` | *(Cobblemon)* Download the mod and rebuild its data, drawn models, item icons and 3D models. Arguments are described in the Portuguese README. |

---

## 🚀 Deploy

The project is set up for continuous deployment on **Vercel** through `vercel.json`:

- **Build command:** `node scripts/build.mjs`
- **Output directory:** `dist`
- Every push to `main` builds and publishes the site.

---

## ⚖️ Legal Notices and Credits

- **Pokémon:** Pokémon, the names of the games, the creatures and the badges are trademarks and intellectual property of **Nintendo**, **Game Freak**, **Creatures Inc.** and **The Pokémon Company**. This is an unofficial, non-profit fan project, artistic and informative, with no commercial ties.
- **Data and art:** names, stats and official illustrations come from [PokéAPI](https://pokeapi.co/) and are reprinted as engravings.
- **Sound:** the music and the key sounds are original to this project and generated in the browser. The Pokémon cries are those of the games, taken from the public [PokeAPI/cries](https://github.com/PokeAPI/cries) repository, and belong to The Pokémon Company.
- **Maps:** every region map is an original redraw made for the atlas.
- **Minecraft:** item and biome names come from the official translation. The 3D models use the average color of each block, and Minecraft ingredients in recipes are redrawn in four ink tones from the game's icons; the original textures are not redistributed. Minecraft is a trademark of Mojang and Microsoft, and this project is not affiliated with them.
- **Typography:** [M PLUS Rounded 1c](https://fonts.google.com/specimen/M+PLUS+Rounded+1c), [DotGothic16](https://fonts.google.com/specimen/DotGothic16), [Archivo](https://fonts.google.com/specimen/Archivo), [Alegreya](https://fonts.google.com/specimen/Alegreya) and [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans), under the *SIL Open Font License*.
- **Cobblemon:** an open-source mod by the Cobblemon team, under *MPL 2.0*. `dados/cobblemon.json` is derived from the mod's data files and Portuguese translation. The Pokémon models, textures and poses, the item icons and the structure pieces used in the 3D models are the work of the Cobblemon team, drawn or exported by this repository's scripts. This project is not affiliated with them.

---

## 👤 Author

Developed by **Bernardo Avendanho**
- **GitHub:** [@Avendanho](https://github.com/Avendanho)
- **Live project:** [https://pokeatlas-eight.vercel.app/](https://pokeatlas-eight.vercel.app/)

---
<p align="center">
  <sub>PokéAtlas — Made with a love for exploration, maps and Pokémon.</sub>
</p>
