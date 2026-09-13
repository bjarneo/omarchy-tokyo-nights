---
name: Tokyo Nights
description: A Tokyo Night pixel arcade with nine drivers and a default yellow Countach.
colors:
  bg: "#16161e"
  night: "#1a1b26"
  panel: "#24283b"
  line: "#343b58"
  muted: "#9aa5ce"
  text: "#c0caf5"
  yellow: "#e0af68"
  yellow-bright: "#ffd578"
  blue: "#7aa2f7"
  cyan: "#7dcfff"
  pink: "#f7768e"
  purple: "#bb9af7"
  green: "#9ece6a"
  orange: "#ff9e64"
  key-border: "#414868"
  instrument-line: "#565f89"
  road-alt: "#262a3f"
  pixel-white: "#e5e9ff"
  driver-selected: "#2d2c3d"
typography:
  display:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(27px, 5.8cqw, 70px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-.035em"
  headline:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(13px, 2.65cqw, 32px)"
    fontWeight: 400
    lineHeight: 1.7
  driver-heading:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(14px, 2.2cqw, 26px)"
    fontWeight: 400
    lineHeight: 1.7
  driver-name:
    fontFamily: '"Courier New", monospace'
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
  driver-preview-name:
    fontFamily: '"Arcade", monospace'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  action:
    fontFamily: '"Arcade", monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: '"Courier New", monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: '"Courier New", monospace'
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "1px"
  score:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(13px, 2.5cqw, 30px)"
    fontWeight: 400
  timer:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(20px, 3.5cqw, 42px)"
    fontWeight: 400
  speed:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(23px, 4cqw, 48px)"
    fontWeight: 400
  checkpoint:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(12px, 1.8cqw, 22px)"
    fontWeight: 400
  crew-heading:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(24px, 3vw, 42px)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-.035em"
  crew-body:
    fontFamily: '"Courier New", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.8
  vr-heading:
    fontFamily: '"Arcade", monospace'
    fontSize: "clamp(22px, 2.6vw, 34px)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-.035em"
  vr-body:
    fontFamily: '"Courier New", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  vr-field:
    fontFamily: '"Courier New", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "normal"
  vr-loadout-caption:
    fontFamily: '"Courier New", monospace'
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  square: "0px"
  keycap: "3px"
spacing:
  "4": "4px"
  "8": "8px"
  "12": "12px"
  "16": "16px"
  "20": "20px"
  "24": "24px"
  "30": "30px"
  "40": "40px"
components:
  button-primary:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.night}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "0 27px"
  button-primary-hover:
    backgroundColor: "{colors.yellow-bright}"
  button-primary-active:
    backgroundColor: "#c99a57"
  button-tool:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.square}"
    padding: "0 4px"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.square}"
    padding: "16px"
  button-touch:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "54px"
  button-touch-nitro:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.yellow}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "54px"
  driver-choice:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    typography: "{typography.driver-name}"
    rounded: "{rounded.square}"
    padding: "8px 4px"
  driver-choice-selected:
    backgroundColor: "{colors.driver-selected}"
    textColor: "{colors.yellow}"
  setup-tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.square}"
    padding: "10px 18px"
  setup-tab-selected:
    textColor: "{colors.yellow}"
  paint-chip:
    rounded: "{rounded.square}"
    width: "28px"
    height: "28px"
  story-objective:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    padding: "16px"
  pit-dialogue:
    backgroundColor: "#16161ef5"
    textColor: "{colors.text}"
    padding: "18px 24px"
  crew-name-button:
    backgroundColor: "{colors.night}"
    textColor: "{colors.text}"
    rounded: "{rounded.square}"
    padding: "8px 14px"
  crew-link:
    backgroundColor: "transparent"
    textColor: "{colors.yellow}"
    rounded: "{rounded.square}"
    padding: "12px"
  arcade:
    backgroundColor: "{colors.night}"
    rounded: "{rounded.square}"
  nitro-track:
    backgroundColor: "{colors.night}"
    padding: "2px"
    height: "10px"
  nitro-fill:
    backgroundColor: "{colors.cyan}"
  nitro-fill-boost:
    backgroundColor: "{colors.yellow}"
  checkpoint-readout:
    backgroundColor: "#1a1b26f5"
    textColor: "{colors.cyan}"
    typography: "{typography.checkpoint}"
    padding: "10px"
  keycap:
    textColor: "{colors.text}"
    rounded: "{rounded.keycap}"
    padding: "5px"
    height: "28px"
  button-song:
    backgroundColor: "transparent"
    textColor: "{colors.yellow}"
    rounded: "{rounded.square}"
    padding: "0 4px"
  button-song-playing:
    textColor: "{colors.cyan}"
  button-vr-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.cyan}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "10px 16px"
  button-vr-secondary-hover:
    backgroundColor: "{colors.panel}"
  vr-select:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    typography: "{typography.vr-field}"
    rounded: "{rounded.square}"
    padding: "10px 8px"
    width: "100%"
  song-notice:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.muted}"
    padding: "12px 18px"
  song-notice-error:
    textColor: "{colors.pink}"
  vr-loadout:
    padding: "12px 0"
  vr-character-preview:
    width: "48px"
    height: "104px"
  vr-car-preview:
    width: "168px"
    height: "108px"
  vr-loadout-caption:
    textColor: "{colors.yellow}"
    typography: "{typography.vr-loadout-caption}"
---

# Design System: Tokyo Nights

## Overview

**Creative North Star: "After-hours arcade cabinet"**

An after-hours arcade cabinet frames a Tokyo expressway in hard-edged pixel art. Tokyo Night indigo, neon signs, and a default yellow Lamborghini Countach establish the identity.

A compact instrument interface keeps the road and car prominent. The skyline, road, vehicles, driver portraits, and boost cameos use original procedural artwork. The garage and nine shareable PNG cards reuse the full-body character artwork.

The seated VR cockpit extends this world through low-poly procedural geometry. Arcade text and rectangular instruments connect its 3D road to the pixel arcade.
VR also reuses the original character, car, garage, logo, and sign artwork.

**Key Characteristics:**
- A yellow Countach is the default in the behind-the-car view.
- Tokyo Night colors connect the interface and scene.
- Pixel titles pair with compact monospace labels.
- Rectangular controls frame a responsive canvas.
- Nine drivers, nine car silhouettes, and nine official Tokyo Night paints use native radio choices.
- Occasional boost cameos feature the selected driver.
- Four finite chapters end with a sunrise arrival and completion screen.
- Optional green shoulder bays pause the timer for four-line Omarchy conversations.
- The original Omarchy text-block logo marks the start screen and roadside signs.
- Cliamp roadside advertisements pair the verified wordmark with spectrum bars.
- The linked crew lineup opens an Omarchy garage with full-body figures and horizontal pan.
- Nine square PNG cameo cards share the original full-body artwork.
- A level, head-tracked cockpit carries the same palette into stereo WebXR.
- Original browser artwork connects the VR garage, cockpit occupants, roadside scenes, and final arcade.

The source rules live in `style.css`, `index.html`, `src/renderer.js`, `src/engine.mjs`, and `src/main.js`. Driver definitions live in `src/characters.mjs`. `src/omarchy-logo.js` renders the supplied text-block logos. The sidecar records motion, breakpoints, shadows, and component examples.

`src/cars.mjs`, `src/story.mjs`, and `src/pit-stops.mjs` define customization, chapters, and conversations. `garage.html` and `garage.css` frame the artwork from `src/full-characters.js` and `src/garage-scene.js`.

Game scenes use procedural artwork rather than pre-rendered raster scenes. Exported PNG artwork includes the cover and nine cameo cards. `tools/create-cameo-cards.mjs` composes the cards and embeds their source provenance.

VR styles live in `vr.css`. `src/vr-scene.js` and `src/vr-panels.js` define the procedural cockpit and textured instruments. `src/song-player.js` supplies the shared MP3 control states.

`src/vr-art.js` adapts `Renderer` artwork for voxel characters, model-specific cars, preview canvases, and signs.

## Colors

Warm yellow stands against dark indigo, with pink signs and cool instrument accents.

### Primary
- **Countach yellow:** `yellow` identifies the default car, primary actions, scores, gear, and active boost meter. Selected driver and car borders and names also use yellow.
- **Bright gold:** `yellow-bright` supplies car highlights, primary borders, and hover feedback.

### Secondary
- **Neon cyan:** `cyan` identifies focus, checkpoint distance, nitro charge, and speed lines.
- **Sign pink:** `pink` colors the first title line, signs, checkpoint progress, collisions, and low time.

### Tertiary
- **Electric blue:** `blue` colors the outer exhaust flames.
- **Night purple:** `purple` colors signs, traffic, and alternate speed lines.
- **Checkpoint green:** `green` marks ready status, checkpoint rewards, and a new personal best.
- **Paint orange:** `orange` colors vehicle paint, Cliamp spectrum bars, and exported card accents.

### Neutral
- **Deep indigo:** `bg` grounds the page. `night` grounds the cabinet and instruments.
- **Road indigo:** `panel` serves the road and touch controls. `road-alt` alternates road bands.
- **Lavender text:** `text` carries primary information. `muted` carries supporting labels.
- **Structural strokes:** `line` frames the cabinet. `key-border` frames keycaps. `instrument-line` frames the nitro meter.
- **Pixel white:** `pixel-white` supplies exhaust cores, collision sparks, and sprite highlights.
- **Selected indigo:** `driver-selected` fills the selected driver and car cards.

**The Shared Palette Rule.** Use the same Tokyo Night accents in the interface and the procedural scene.

The nine official Tokyo Night paints in `src/cars.mjs` reuse these tokens:

| Paint | Color token |
| --- | --- |
| Amber | `yellow` |
| Rose | `pink` |
| Orange | `orange` |
| Green | `green` |
| Blue | `blue` |
| Cyan | `cyan` |
| Purple | `purple` |
| Silver | `text` |
| Slate | `instrument-line` |

Character-specific colors and derived vehicle shades stay local to the sprite code.
Arcade cassette pickups use yellow, power cells use green, and nitro canisters use cyan.
Green shoulder bays, `P` signs, and side labels identify optional pit stops.

VR reuses these colors for its cockpit, city, and controls. Cassette pickups use pink, power cells use green, and cyan frames mark both drops.
Mission text turns green on completion. The DOM song button uses yellow at rest and cyan during play. Song errors use pink.

VR crew tags and preview captions use yellow. Car tags and nitro pickups use cyan. Green identifies optional pit areas and Omarchy sign borders.

## Typography

`Arcade` loads from `assets/arcade.woff2` with a monospace fallback. `Courier New` supplies supporting text with a monospace fallback. Most text uses regular weight. Roster names use bold Courier New. The interface disables synthetic faces.

**The Instrument Type Rule.** Use Arcade for titles, primary actions, and main instrument values. Use Courier New for supporting labels and instructions.

The frontmatter records the base hierarchy. Container-relative units scale against the screen container. Score, time, and speed use tabular numerals.

| Role | Use | Override at widths up to `700px` |
| --- | --- | --- |
| `display` | Two-line title | `7.8cqw`, line height `1.3` |
| `headline` | Pause and results headings | `12px` |
| `driver-heading` | Driver and car selector headings | `13px` |
| `driver-name` | All driver and car roster labels | No size change |
| `driver-preview-name` | Selected driver and car names | `14px` for drivers, `12px` for cars |
| `crew-heading` | Garage page title | `24px` |
| `crew-body` | Garage introduction, help, and driver detail | No size change |
| `action` | Start, resume, and retry | No size change |
| `body` | Instructions and support copy | Overlay copy uses `12px` |
| `label` | Instrument labels | HUD letter spacing becomes `0` |
| `score` | Race score | `13px` |
| `timer` | Time remaining | `24px` |
| `speed` | Current speed | `25px` |
| `checkpoint` | Distance remaining | `14px` |

The wordmark and personal best use small Arcade text. Results use a separate score size of `clamp(20px, 4cqw, 48px)`, reduced to `24px` on mobile.

Driver details use `12px` Courier New with line height `1.5`. Roster names use bold Courier New. A checkmark identifies each selected card.
Tabs use `12px` Courier New with letter spacing `.5px`. Short touch landscape uses a `14px` selector heading and bold `12px` Courier New preview names.

Story text uses `14px` Courier New with line height `1.9`. Objective text uses `14px` with line height `1.7`. Both become `12px` on mobile.

Pit dialogue uses `14px` Courier New with line height `1.8`, reduced to `12px` on mobile. Speaker names use `16px` Arcade, then `14px` on mobile and `12px` in short touch landscape.

VR setup and state headings use `vr-heading`, with `27px` text at widths up to `760px`. Introductory copy uses `vr-body`, and native selects use `vr-field`.
Cockpit canvas textures use Arcade for headings, primary actions, speed, time, and distance. Courier New carries menu choices, objectives, and supporting instrument labels.
Selected-character and car captions use `vr-loadout-caption`. Spatial name tags use Courier New on rectangular canvas textures.

## Layout

- **Page:** The centered container caps at `1280px`, including `40px` side padding. The body supports widths from `320px`.
- **Cabinet:** A `104px` masthead precedes a bordered screen with a `44px` toolbar and status strip. The screen uses a `16:9` ratio.
- **Compact toolbar:** The arcade uses an inline-size container. At container widths up to `600px`, the toolbar uses compact route text and icon-only controls. Toolbar side padding becomes `10px`, and its gap becomes `6px`. Tool gaps become `4px`, with `40px` minimum button widths.
- **Canvas:** The renderer uses a native width of `480` when the screen measures at most `700px`. Otherwise, it uses `640`. Height follows the measured screen ratio, so mobile preserves the road width.
- **HUD:** Top instruments use `4%` side insets and a `5%` top inset. Lower instruments sit `7%` above the bottom. Nitro occupies `18%` of the lower row.
- **Driver and car selectors:** Each picker uses `210px minmax(0, 1fr)` columns, a `28px` gap, and width `min(100%, 760px)`. The selection screen has a `620px` minimum height.
- **Roster:** Nine choices form a `3 × 3` grid with `8px` gaps and `6px` fieldset padding. The roster scrolls vertically within the overlay.
- **Selected previews:** Driver portraits display at `168 × 196px`, beside `60 × 70px` roster portraits. Car previews display at `210 × 135px`, beside `88 × 57px` roster cars.
- **Paint row:** Nine swatches use `28 × 28px` chips, `4px` option padding, and `6px` gaps. A name and hex legend sits above them.
- **Spacing:** Small gaps separate controls and keycaps. Larger gaps separate control groups, results, and page regions. The frontmatter records recurring steps, rather than a uniform grid.
- **Up to `1100px`:** Side padding becomes `28px`. The drive tip disappears and the keyboard strip centers.
- **Up to `700px`:** Side padding becomes `16px`. The masthead becomes `83px` tall. The screen uses `4:3`, compact route text, and icon-only toolbar controls.
- **Mobile HUD:** The top inset becomes `6%`. Nitro occupies `27%` of the lower row. Checkpoint support text wraps within `90px`.
- **Mobile results:** The screen becomes `420px` tall. The results overlay permits vertical scroll and uses safe center alignment.
- **Mobile selection:** The screen uses height `min(620px, calc(100dvh - 160px))`, minimum height `510px`, and automatic aspect ratio. Overlay padding becomes `18px 12px 12px`.
- **Mobile previews:** The picker stacks its preview above the roster with a `12px` gap. Driver previews use `72 × 84px`, and roster portraits use `48 × 56px`.
- **Mobile car choices:** The selected car uses `100 × 64px`, and roster cars use `56 × 36px`. Paint chips become `22 × 28px` with `2px` row gaps.
- **Mobile story and pit panels:** Story height is `480px`, and completion height is `420px`. Pit height is `min(560px, calc(100dvh - 150px))` with a `500px` minimum.
- **Coarse pointers:** Touch controls replace the keyboard strip. They sit below the cabinet with `8px` gaps and a `12px` top margin.
- **Short touch landscape:** At heights up to `520px`, outer controls move beside the cabinet. The screen caps at `100dvh - 64px`, and the race view uses `16:9`. The cabinet caps at `calc((100dvh - 64px) * 16 / 9)`. Brake sits above nitro with an `8px` gap and a `62px` bottom offset.
- **Landscape selection:** The screen uses height `calc(100dvh - 64px)` with no minimum height. The overlay uses `12px 20px` padding. The picker uses `120px minmax(0, 1fr)` columns and a `12px` gap.
- **Landscape previews:** Driver previews use `60 × 70px`, and roster portraits use `24 × 28px`. Car previews use `112 × 72px`, and roster cars use `44 × 28px`. Paint chips use `22 × 20px`.
- **Landscape choices:** Roster gaps become `6px`. Cards use `4px` padding and `2px` internal gaps. The introduction and driver details hide. Actions share one row with a `12px` gap.
- **Large displays:** At least `1500px` wide and `950px` tall, the page adds `30px` top padding.
- **Fullscreen:** The cabinet centers within the viewport at `16:9`. Width accounts for `94px` of interface height, or `166px` with coarse pointers. Touch controls stay below the cabinet.
- **Fullscreen selection:** The screen uses height `min(560px, calc(100dvh - var(--fullscreen-chrome)))` and automatic aspect ratio. Selection sets `--fullscreen-chrome` to `74px`.
- **Garage page:** `garage.css` caps the centered page at `1640px`, with `24px` side padding. At widths up to `700px`, side padding becomes `16px` and masthead height becomes `76px`.
- **Garage scene:** The `1728 × 900` canvas fills an artwork container with minimum width `1280px`. The stage uses horizontal overflow and a `1px` line-colored border.
- **Garage figures:** Each `48 × 104` sprite occupies `144 × 312` canvas pixels. Nine equal columns distribute the figures. The minimum artwork width preserves their scale on mobile.
- **Garage labels:** Nine equal grid columns sit `8%` above the bottom. Labels use `8px 10px` padding, `12px` text, line height `1.5`, and `#16161ed9` fill.
- **Garage navigation:** Name buttons wrap with `8px` gaps and `16px 0` row margins. Buttons use `40px` minimum height and `8px 14px` padding. Mobile gaps become `6px`, with `10px` horizontal button padding.
- **Garage support:** The detail line reserves `26px` minimum height with a `14px` top margin. Download links wrap with `12px` gaps and a `16px` top margin.
- **VR desktop:** The scene fills the main region behind a `416px` setup panel. The panel uses a `32px` left margin and `30px 28px 24px` padding.
- **VR setup:** Driver and paint share a row. Car spans the next row. Fields use `14px 12px` gaps, and actions use `10px` gaps.
- **VR preview row:** Original character and car canvases precede the selects in `100px 1fr` columns with a `20px` gap. Figures align at the bottom.
- **VR preview spacing:** The row uses `vr-loadout` padding, line-colored top and bottom borders, and a `24px` bottom margin. Figure contents use `10px` gaps.
- **VR mobile:** At widths up to `760px`, a `36dvh` preview with a `230px` minimum height precedes the full-width panel. Panel padding becomes `24px`.
- **VR toolbar wrap:** Mobile controls wrap with `0 8px` gaps. The measured header, footer, and song notice determine `--vr-chrome` and the available race height.
- **VR race:** The setup panel hides during countdown and play. Screen readouts remain visible, and coarse pointers or narrow screens receive four touch controls.
- **VR headset:** The dashboard attaches to the cockpit. A separate spatial menu shows setup, pause, chapter briefings, pit conversations, failure, and delivery states. The surface brief records its dimensions.
- **VR garage:** The selected car occupies the center, with four cars on each side. Nine voxel crew members stand around the cars and original garage facade.
- **Song status:** A full-width status strip follows the arcade toolbar or VR header. It occupies space only during a pending request or error.

## Elevation & Depth

Thin strokes and dark surface layers define the cabinet. One soft shadow separates it from the page. Translucent indigo panels protect checkpoint text and pause or results content.

HUD text, countdown text, and race messages use soft shadows for contrast. The sidecar records their exact values. Depth inside the game comes from road projection, sprite scale, skyline layers, and hard-edged light bands.

A stationary scanline texture covers the screen. Reduced motion hides this texture.

VR depth comes from stereo projection, low-poly geometry, directional light, and distance fog. Opaque indigo canvas panels protect instruments and menu text.
VR draws the ground and road before the cockpit with `depthWrite = false` to prevent stereo instrument occlusion.
The rear-view mirror uses a separate scene render. Comfort view adds a speed-dependent peripheral mask.

## Shapes

The cabinet, buttons, meters, status lights, and signs use rectangular geometry. Keycaps provide the small-radius exception, with a heavier bottom border. Inline SVG supplies interface icons.

The canvas uses crisp pixel scaling with image smoothing disabled. The renderer rounds primitive coordinates and builds sprites from rectangles and polygons.

VR uses procedural boxes for the city, traffic, cockpit, and pickups. The wheel uses a low-poly torus. Menu planes and native setup controls remain rectangular.
Cockpit textures use nearest-neighbor magnification and linear minification. The 3D renderer uses antialiasing.

`VRArt` extrudes same-color runs from the original full-body sprites into instanced boxes. Separate head, torso, and leg parts support standing and seated characters.
Art textures use nearest-neighbor magnification and minification without mipmaps. Model-specific car geometry retains original rear sprites, and branded signs retain the block logos and pixel glyphs.

## Components

### Arcade controls

- **Primary action:** A gold rectangle uses a bright border and centered pixel text. Minimum height is `49px`, reduced to `44px` on mobile.
- **Toolbar action:** A transparent button uses muted text and an inline icon. Hover turns yellow. A pressed sound toggle turns cyan.
- **Text action:** A borderless secondary action changes from muted to primary text on hover. Mobile padding becomes `12px`.
- **Touch action:** Panel-colored buttons use a minimum width of `55px`. Nitro uses yellow text and a translucent gold border. A held control gains a line-colored fill and cyan border.
- **Keyboard legend:** Keycaps use a `1px` border with a `3px` bottom edge. The wide Space key adds horizontal padding.
- **Focus:** Buttons, links, and the canvas use a `2px` cyan outline with `5px` offset. Toolbar buttons use an inset `-2px` offset.
- **Disabled state:** Controls use opacity `0.36` and a default cursor. Touch controls enable during countdown and play.

### Driver and car selection

A dark overlay pairs native radio choices with larger selected previews and separate `DRIVER` and `CAR & COLOR` tabs.

- **Flow:** Start, retry, and new-run actions open the selector. DHH, Countach, and Amber are the defaults. Confirmation opens the first chapter briefing.
- **Persistence:** Confirmation stores the driver, car, and paint under `tokyo-nights.character`, `tokyo-nights.car`, and `tokyo-nights.paint`. Back or Escape restores the prior screen and confirmed choices.
- **Native behavior:** Driver, car, and paint choices use separate native radio groups. Left and Right move one roster choice. Up and Down move three choices. Home and End select the first and last choices. Enter on either roster or the named drive action confirms the setup.
- **Tabs:** Left, Right, Home, and End move tab focus. The active tab uses yellow text and a `2px` bottom border. The inactive panel hides. Tabs use `40px` minimum height, reduced to `36px` on mobile and `28px` in short touch landscape.
- **Unselected state:** Cards use panel fill and a `2px` line-colored border. Hover changes the border to muted.
- **Selected state:** The checked card uses `driver-selected` fill and a `2px` Countach yellow border. Its name turns yellow, and an inline SVG checkmark appears.
- **Focus:** A focused radio gives its card a `2px` cyan outline with `5px` offset. The selector focuses the checked radio when it opens.
- **Portraits:** The renderer draws `48 × 56` portrait buffers from cached `32 × 38` smile sprites. Every driver also has back and profile cameo poses. DHH retains the supplied photo's wavy hair, blue-gray eyes, short beard, and broad smile. Ryan retains glasses, swept-back hair, a goatee, and colored shirt dots.
- **Surface:** The overlay uses `#16161ef2`, safe center alignment, `24px` padding, and hidden overflow. The roster owns vertical scroll. Cards use `8px 4px` padding and `6px` internal gaps.
- **Paint:** Each swatch has a native radio, accessible color name, and inline checkmark. Selection adds a `2px` text-colored outline with `2px` offset. Focus changes it to cyan with `3px` offset. The legend shows the selected name and hex. All car previews update with the paint.

The roster contains DHH, Ryan, Bjarne, Tobi, Hancore, Spencer, Krzysztof, Outfoxxed, and Emir.
Bjarne and Spencer use colorized artwork. Bjarne has a navy jacket and coffee mug. Spencer has a blue shirt.
Hancore uses the skull avatar. Outfoxxed follows the replacement portrait with swept brown hair, silver-framed glasses, a teal shirt, and a dark jacket.

`src/car-sprites.js` draws nine distinct silhouettes:

| Model | Distinctive form |
| --- | --- |
| Lamborghini Countach | Wedge body and wide rear wing |
| Nissan Skyline GT-R | Boxy coupe and four round tail lights |
| Toyota Supra | Rounded body and tall curved wing |
| Mazda RX-7 | Curved hatch and dark rear light panel |
| Honda NSX | Low roof and full-width rear lights |
| Porsche 911 Turbo | Rounded cabin and large rear spoiler |
| Ferrari F40 | High rear wing and three exhausts |
| Toyota AE86 | Upright hatch and two-tone bumpers |
| Datsun 240Z | Sloped hatch and chrome rear bumper |

### Omarchy and Cliamp branding

The original Omarchy text-block logo connects the start screen, roadside signs, garage scenes, and cameo cards.

The source assets are `assets/omarchy-logo.txt` and `assets/cliamp-logo.txt`. `src/omarchy-logo.js` draws the block characters into canvases. `Renderer` caches both wordmarks.

Omarchy logo pixels use `text`. The start-screen logo centers in the footer with width `clamp(84px, 14cqw, 180px)` and automatic height. Every third roadside sign shows the cached logo within a green rectangular border.

The next sign in each three-sign cycle advertises Cliamp. Its verified block wordmark uses yellow inside a cyan frame.
Eight spectrum bars accompany `TUI MUSIC PLAYER` and `CLIAMP.STREAM`. Reduced motion keeps the spectrum bars stationary.
Garage scenes show only Omarchy branding.

### Crew links, garage, and cameo cards

The lower-right start-screen lineup contains all nine drivers and links to `garage.html`.
Its width is `clamp(180px, 25cqw, 300px)`, reduced to `180px` on mobile.
At widths up to `700px`, the visible footer link reads `MEET THE CREW` in yellow `12px` text.
The footer link uses inline flex and a `24px` minimum height. Short touch landscape hides the footer and restores the lineup caption.

`garage.html` shows the full-body crew outside the three-bay Omarchy garage.
`src/full-characters.js` supplies the `48 × 104` sprite buffers. `src/garage-scene.js` supplies the shared procedural backdrop.
The page also displays the confirmed car and paint.

Name buttons center the selected figure, set `aria-pressed`, update the live description, and select its PNG download.
Horizontal pan preserves the wide scene on mobile. Reduced motion changes name-button scroll from smooth to instant.
The focusable stage uses a `2px` cyan outline with `4px` offset. Name buttons use yellow borders and text on hover or selection.

Nine shareable cameo PNG cards pair each full-body figure with its name, character detail, Tokyo Nights title, and Omarchy logo.
Each card uses a square `360 × 360` composition with a dark panel, thin border, and colored corner marks.
The exporter scales it to `1080 × 1080` with image smoothing disabled.
Each PNG embeds source provenance under `impeccable:prompt` in a `tEXt` chunk.

Local files occupy `exports/cameo-cards/` and `exports/cameo-cards.zip`.
Published copies occupy `assets/cameo-cards/` and `assets/cameo-cards.zip`.
Filenames follow `<character-id>.png`. Garage download links provide the complete ZIP and the selected driver's card.

### Race instruments and state panels

The HUD keeps score left, time centered, and checkpoint distance right. Speed and gear sit below right. Nitro sits below left with a bordered track and left-origin fill.

The nitro meter changes from cyan to yellow during boost. Its text reports charge state, and its meter value updates accessibly. Time turns pink at ten seconds or less.

Pause and results use centered dark overlays with pink headings and a gold primary action. State changes focus the checked driver radio, canvas, or relevant panel action. Live announcements report major race events.

### Story chapters and arrival

Four finite chapters each cover `3km`. Briefings show the chapter, district, time, story text, and boxed objective.
The content caps at `580px` within a scrollable overlay with `32px` padding and `#16161eef` fill.
The timer pauses during briefings. `BEGIN CHAPTER` starts the countdown.

| Chapter | District | Objective |
| --- | --- | --- |
| The Last Tape | Shinjuku | Collect one cassette before the exit. |
| Lights Out | Shibuya | Collect two power cells before the exit. |
| Through the Traffic | Akihabara | Pass six cars during this chapter. |
| Before Sunrise | Rainbow Bridge | Reach the arcade with at most two collisions during this chapter. |

The mission instrument shows progress and the next drop's lane. It uses cyan text, then green for a complete objective.
Its dark panel sits at `top: 22%` and `left: 4%`, with `46%` maximum width and `8px` padding.
Mobile moves it to `top: 28%` with `5px` padding.
An unmet objective at an exit ends the run. A third collision ends the final chapter immediately.

The final exit starts a six-second sunrise arrival at the Omarchy arcade on Tokyo Bay.
Hard-edged dawn bands, a pixel sun, restored arcade lights, and the selected car close the drive.
`SEE RESULTS` skips to the completion screen. `DELIVERY COMPLETE.` accompanies the score, distance, passed cars, and `4/4` chapter count.
`PLAY AGAIN` opens a new campaign setup with the confirmed choices.

### Optional pit stops

Green shoulder bays and `P` signs mark optional stops at randomized route positions.
The side-specific HUD label identifies the bay and asks the player to enter the green mark.
Passing on the road continues the race. Deliberate shoulder entry starts the `pit-enter` transition.
The car stops over `1.25s`, then the view shows two full-body figures outside the Omarchy garage.

The companion differs from the selected driver. Four lines alternate between the companion and driver.
Nine topics cite the Omarchy manual in `src/pit-stops.mjs`. The next conversation avoids the previous topic.

The current speaker faces forward. The other figure uses a profile pose. Yellow identifies the companion, and cyan identifies the driver.

The dialogue panel sits along the bottom with a `1px` top border and content width capped at `680px`.
It shows the speaker, topic, dialogue line, and progress from `1 / 4` to `4 / 4`.
`CONTINUE` advances the dialogue. The final button reads `BACK TO THE RUN`.
The race timer pauses throughout the transition and conversation.
The final action returns to the same lane and distance with a full `100`-charge nitro tank.

### Speed and boost cameo

Cruise targets `285 km/h`, gas targets `340 km/h`, and boost targets `460 km/h`. The renderer multiplies world travel by `1.85` to strengthen the sense of speed.

A full nitro tank lasts eight seconds at `12.5` charge per second.
Randomized cyan-blue canisters restore `45` charge, capped at `100`.
The tank recharges when boost stops.

Speed lines start at `160 km/h` and intensify with speed. Boost adds exhaust flames and shifts focal length from `55` toward `42`, with interpolation factor `0.08` per frame.

The first boost of each run introduces the selected driver. Later boost onsets use a `35%` chance roll after the `20s` cooldown. Each cameo starts the cooldown. A held boost does not retrigger the cameo.

All nine drivers use `cameoPose` for the same `2.6s` sequence. The head emerges over `0.4s`, turns to profile at `0.6s`, and smiles at `0.88s`. The selected driver's name tag appears from `0.95s` to `1.8s`. Return starts at `1.85s` and ends at `2.6s`. Early boost release advances the sequence to the return phase.

### Motion controls

Button color feedback uses `120ms ease-out`. Driver borders and backgrounds use the same duration and `ease-out` curve. `prefers-reduced-motion: reduce` removes these transitions, scanlines, title travel, speed lines, camera shake, car bounce, steering tilt, and collision flicker.

Reduced motion shows the selected driver's stationary smile after `0.15s` and before `2.25s`, without a head turn or hair wave. Road travel, exhaust, and gameplay remain active. The renderer responds when the preference changes.

The toolbar pause action, `P`, and `Escape` pause the simulation. Window blur and document visibility loss also pause the simulation.

### VR setup and cockpit controls

The seated cockpit carries the established instrument palette into spatial panels.

- **Setup fields:** Native selects use `vr-select` with a `1px` line-colored border and `44px` minimum height. Focus uses a `2px` cyan outline with `4px` offset.
- **Comfort control:** An `18px` native checkbox uses a cyan accent inside a `44px` minimum-height label with explanatory text.
- **Primary action:** WebXR entry reuses `button-primary`. The support text reports readiness in green and errors in pink.
- **Screen action:** `button-vr-secondary` uses a `46px` minimum height and a `1px` line-colored border. Hover adds panel fill and a cyan border.
- **Spatial actions:** Gold identifies the main action. Secondary controls use panel fill and text-colored labels. Controller hover adds a `4px` cyan stroke.
- **Dashboard:** Speed, time, checkpoint distance, nitro, score, and mission progress remain inside the cockpit. The next unresolved pickup includes a lane label.
- **Neutral stereo view:** Keep all dashboard instrument values and `MENU` visible without a head turn.
- **Chapter panels:** Pink headings introduce chapter text and cyan objectives. The primary action begins the chapter. Failure panels show the engine's failure reason.
- **Delivery state:** The final scene shows the Omarchy arcade with all nine voxel characters. The menu presents the delivery message and a results action.
- **Stable view:** The cockpit stays level without camera shake or boost zoom. Head movement controls the immersive view, and seat centering resets its position and yaw.
- **Comfort view:** The enabled preference darkens the periphery above `130 km/h`. The sidecar records the mask formula. Shared button transitions respect reduced motion.

### VR original art and garage

The garage, cockpit occupants, and roadside scenes reuse the browser game's original artwork.

- **Preview canvases:** `vr-character-preview` displays original full-body art. `vr-car-preview` scales a `112 × 72` pixel buffer. Captions and image labels follow the selected driver, car, and paint.
- **View control:** The toolbar reuses `button-tool` and names the destination `GARAGE` or `COCKPIT`. A pressed state marks the active garage in cyan.
- **Spatial selection:** Controller rays and screen clicks select visible crew members and cars before a run or from results. Native selects remain available.
- **Garage models:** All nine cars use model-specific body and cabin geometry, wheel placement, and optional spoilers. The selected car uses the selected paint and moves to the central bay.
- **Occupants:** The driver has a seated voxel body. The passenger uses the next character in roster order. The mirror includes both occupants.
- **Cameo:** `cameoPose` supplies the original back, profile, and smile sequence. The driver leans out of the window, and a name tag accompanies the greeting.
- **Art motion:** Reduced motion keeps the smile pose, removes idle head motion, and fixes exhaust length. The preference responds to changes during play.
- **Roadside art:** Non-van traffic uses original car rear sprites. Omarchy and Cliamp block logos accompany the browser renderer's pixel sign glyphs.
- **Pit areas:** Green bay edges and a `PIT STOP` sign identify optional stops. Guardrail openings expose the shoulder, and two crew members stand beside the bay.
- **Pit dialogue:** Both participants appear as physical characters. The headset panel pairs the current speaker's full-body artwork with text, progress, and a gold continue action.
- **Pit return:** The final action reads `BACK TO RACE`. Departure restores full nitro and resumes the same run.

### MP3 song controls

A shared song action uses the toolbar pattern in `index.html` and `vr.html`. Cockpit menus provide the same action on a rectangular spatial button.

- **Default:** DOM song controls use `button-song` and show `PLAY SONG`. The arcade includes an inline music-note SVG. Compact arcade toolbars hide the text but retain the accessible name.
- **Active:** The DOM button shows `PAUSE SONG` in cyan and sets `aria-pressed` to `true`. Pause retains the song position, and the next play action resumes it.
- **Pending:** The DOM label becomes `LOAD SONG` with the accessible name `Cancel song load`. Cockpit menus show `CANCEL SONG LOAD`.
- **Feedback:** `song-notice` reports a pending request through `role="status"`. Errors use `song-notice-error` and explain how to retry. The control remains available.
- **Headset feedback:** Menus show pending and error text. During a drive, the message panel directs the player to the menu for cancellation or retry.
- **Audio:** The MP3 starts only after a song action. The separate sound toggle controls race audio, and the synthesized tune stops while the MP3 plays.
- **Focus loss:** Screen focus loss pauses the song. VR visibility or tracking loss pauses the drive and song.

## Do's and Don'ts

### Do:
- **Do** preserve the default yellow Countach and behind-the-car pixel view.
- **Do** share the Tokyo Night palette between interface controls and procedural artwork.
- **Do** keep the full road width and visible touch controls through responsive and fullscreen states.
- **Do** preserve focus outlines, text-backed status, and reduced-motion behavior.
- **Do** preserve the supplied Omarchy text-block logo on the start screen and roadside signs.
- **Do** keep pit stops optional through deliberate entry into a marked shoulder bay.
- **Do** preserve the wide garage scene and figure size through horizontal pan on mobile.
- **Do** keep source provenance in exported PNG artwork.

### Don't:
- **Don't** smooth the pixel artwork or replace its hard-edged geometry with photographic imagery.
- **Don't** replace rectangular arcade controls with pill-shaped controls.
- **Don't** let skyline detail obscure checkpoint information.
- **Don't** repeat the cameo continuously during one held boost.
- **Don't** add Cliamp advertisements to garage scenes.
