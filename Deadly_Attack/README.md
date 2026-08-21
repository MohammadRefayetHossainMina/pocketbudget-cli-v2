# Deadly Attack — The Neon Shadow

Side-scrolling action game (vanilla **JavaScript + HTML5 Canvas 2D**). No engine, no build step, no image assets yet.

Year 2086, Neon Crime City. You are **Ayan**. Fifty underground floors. **The Kingpin** waits at the bottom.

## How to run

**Double-click `index.html`** (or `Play.bat` on Windows). No server. `localhost:8080` will refuse to connect unless you start one yourself.

If a browser blocks local files, right-click `index.html` → Open with → Edge or Chrome.

## Controls

| Key | Action |
|---|---|
| A / D or Arrows | Move |
| W / Up / K | Jump |
| Space | Shoot |
| Enter | Start / next stage |
| R | Restart from stage 1 |

## Cylinders (gameplay-first art)

Everyone is a **2D cylinder**. **Color = type. Size = boss.**

- Blue — Ayan (you)
- Orange — street thug (stages 1–10)
- Yellow — biker / slide-runner (11–20)
- Cyan — drone (flies, 11–20)
- Magenta — cyborg (ranged, 21–30)
- Red — elite guard (31–40)
- Gray, taller — mecha-suit (41–50)
- Gold, largest — Kingpin (stage 50 boss)

Mini-bosses use the biome’s type at ~1.8× size. Animation is procedural (walk bob, squash, hit flash, boss pulse) so a laptop stays light. Sprite sheets come after each biome’s combat feels right.

## Stages

Difficulty scales every floor (`hp *= 1 + 0.12 * (stage-1)`). Live enemies cap at 14; bullets are pooled.

1. Slums 1–10
2. Subway 11–20
3. Labs 21–30
4. Skyscraper 31–40
5. Penthouse 41–50 + Kingpin

## Layout

```
Deadly_Attack/
  index.html
  Play.bat
  css/style.css
  js/
    main.js          game loop
    config.js        50 stages, types, biomes, scaling
    draw.js          cylinder primitive + motion
    player.js
    enemy.js
    bullets.js
    stage.js
    hud.js
    background.js    3-layer shape parallax
    screens.js
    input.js
    util.js
    animation.js     walk bob, squash, boss pulse, hit flash
```
