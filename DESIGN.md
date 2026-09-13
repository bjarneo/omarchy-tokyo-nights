---
name: Tokyo Nights
description: A Tokyo Night pixel arcade with a yellow Lamborghini Countach.
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
    fontFamily: '"Arcade", monospace'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "normal"
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
    rounded: "{rounded.square}"
    padding: "16px 18px 14px"
  driver-choice-selected:
    backgroundColor: "{colors.driver-selected}"
    textColor: "{colors.yellow}"
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
---

# Design System: Tokyo Nights

## Overview

**Creative North Star: "After-hours arcade cabinet"**

An after-hours arcade cabinet frames a Tokyo expressway in hard-edged pixel art. Tokyo Night indigo, neon signs, and a yellow Lamborghini Countach establish the identity.

A compact instrument interface keeps the road and car prominent. The skyline, road, vehicles, driver portraits, and boost cameos use original procedural artwork.

**Key Characteristics:**
- A yellow Countach anchors the behind-the-car view.
- Tokyo Night colors connect the interface and scene.
- Pixel titles pair with compact monospace labels.
- Rectangular controls frame a responsive canvas.
- Driver selection uses native radios and pixel portrait canvases.
- Occasional boost cameos feature the selected driver.
- The original Omarchy text-block logo marks the start screen and roadside signs.

The source rules live in `style.css`, `index.html`, `src/renderer.js`, `src/engine.mjs`, and `src/main.js`. Driver definitions live in `src/characters.mjs`. `src/omarchy-logo.js` renders the supplied text-block logo. The sidecar records motion, breakpoints, shadows, and component examples. The build has no shipping raster assets.

## Colors

Warm yellow stands against dark indigo, with pink signs and cool instrument accents.

### Primary
- **Countach yellow:** `yellow` identifies the car, primary actions, scores, gear, active boost meter, and selected driver borders and names.
- **Bright gold:** `yellow-bright` supplies car highlights, primary borders, and hover feedback.

### Secondary
- **Neon cyan:** `cyan` identifies focus, checkpoint distance, nitro charge, and speed lines.
- **Sign pink:** `pink` colors the first title line, signs, checkpoint progress, collisions, and low time.

### Tertiary
- **Electric blue:** `blue` colors the outer exhaust flames.
- **Night purple:** `purple` colors signs, traffic, and alternate speed lines.
- **Checkpoint green:** `green` marks ready status, checkpoint rewards, and a new personal best.

### Neutral
- **Deep indigo:** `bg` grounds the page. `night` grounds the cabinet and instruments.
- **Road indigo:** `panel` serves the road and touch controls. `road-alt` alternates road bands.
- **Lavender text:** `text` carries primary information. `muted` carries supporting labels.
- **Structural strokes:** `line` frames the cabinet. `key-border` frames keycaps. `instrument-line` frames the nitro meter.
- **Pixel white:** `pixel-white` supplies exhaust cores, collision sparks, and sprite highlights.
- **Selected indigo:** `driver-selected` fills the selected driver card.

**The Shared Palette Rule.** Use the same Tokyo Night accents in the interface and the procedural scene.

## Typography

`Arcade` loads from `assets/arcade.woff2` with a monospace fallback. `Courier New` supplies supporting text with a monospace fallback. The interface uses regular weight and disables synthetic faces.

**The Instrument Type Rule.** Use Arcade for titles, primary actions, and main instrument values. Use Courier New for supporting labels and instructions.

The frontmatter records the base hierarchy. Container-relative units scale against the screen container. Score, time, and speed use tabular numerals.

| Role | Use | Override at widths up to `700px` |
| --- | --- | --- |
| `display` | Two-line title | `7.8cqw`, line height `1.3` |
| `headline` | Pause and results headings | `12px` |
| `driver-heading` | Driver selector heading | `13px` |
| `driver-name` | DHH and Ryan names | `12px` |
| `action` | Start, resume, and retry | No size change |
| `body` | Instructions and support copy | Overlay copy uses `12px` |
| `label` | Instrument labels | HUD letter spacing becomes `0` |
| `score` | Race score | `13px` |
| `timer` | Time remaining | `24px` |
| `speed` | Current speed | `25px` |
| `checkpoint` | Distance remaining | `14px` |

The wordmark and personal best use small Arcade text. Results use a separate score size of `clamp(20px, 4cqw, 48px)`, reduced to `24px` on mobile.

Driver details and selection labels use `12px` `Courier New`. Details use line height `1.5`. Selection labels use letter spacing `.5px`. Short touch landscape uses a `14px` driver heading and `12px` driver names.

## Layout

- **Page:** The centered container caps at `1280px`, including `40px` side padding. The body supports widths from `320px`.
- **Cabinet:** A `104px` masthead precedes a bordered screen with a `44px` toolbar and status strip. The screen uses a `16:9` ratio.
- **Compact toolbar:** The arcade uses an inline-size container. At container widths up to `600px`, the toolbar uses compact route text and icon-only controls. Toolbar side padding becomes `10px`, and its gap becomes `6px`. Tool gaps become `4px`, with `40px` minimum button widths.
- **Canvas:** The renderer uses a native width of `480` when the screen measures at most `700px`. Otherwise, it uses `640`. Height follows the measured screen ratio, so mobile preserves the road width.
- **HUD:** Top instruments use `4%` side insets and a `5%` top inset. Lower instruments sit `7%` above the bottom. Nitro occupies `18%` of the lower row.
- **Driver selector:** Two equal columns occupy `min(100%, 464px)` with an `18px` gap. Portraits display at `144px` by `168px`.
- **Spacing:** Small gaps separate controls and keycaps. Larger gaps separate control groups, results, and page regions. The frontmatter records recurring steps, rather than a uniform grid.
- **Up to `1100px`:** Side padding becomes `28px`. The drive tip disappears and the keyboard strip centers.
- **Up to `700px`:** Side padding becomes `16px`. The masthead becomes `83px` tall. The screen uses `4:3`, compact route text, and icon-only toolbar controls.
- **Mobile HUD:** The top inset becomes `6%`. Nitro occupies `27%` of the lower row. Checkpoint support text wraps within `90px`.
- **Mobile results:** The screen becomes `420px` tall. The results overlay permits vertical scroll and uses safe center alignment.
- **Mobile selection:** The screen becomes `480px` tall. The overlay uses `20px 16px 12px` padding. Choices use `12px` gaps and `12px 8px` padding, with `96px` by `112px` portraits.
- **Coarse pointers:** Touch controls replace the keyboard strip. They sit below the cabinet with `8px` gaps and a `12px` top margin.
- **Short touch landscape:** At heights up to `520px`, outer controls move beside the cabinet. The screen caps at `100dvh - 64px`, and the race view uses `16:9`. The cabinet caps at `calc((100dvh - 64px) * 16 / 9)`. Brake sits above nitro with an `8px` gap and a `62px` bottom offset.
- **Landscape selection:** Choices cap at `430px`. The overlay uses `12px 20px` padding. Cards use `48px 1fr` columns, two `24px` rows, `4px 8px` gaps, and `8px` padding. Portraits use `48px` by `56px`. The introduction and driver details hide. Actions share one row with a `12px` gap.
- **Large displays:** At least `1500px` wide and `950px` tall, the page adds `30px` top padding.
- **Fullscreen:** The cabinet centers within the viewport at `16:9`. Width accounts for `94px` of interface height, or `166px` with coarse pointers. Touch controls stay below the cabinet.
- **Fullscreen selection:** The screen uses height `min(560px, calc(100dvh - var(--fullscreen-chrome)))` and automatic aspect ratio.

## Elevation & Depth

Thin strokes and dark surface layers define the cabinet. One soft shadow separates it from the page. Translucent indigo panels protect checkpoint text and pause or results content.

HUD text, countdown text, and race messages use soft shadows for contrast. The sidecar records their exact values. Depth inside the game comes from road projection, sprite scale, skyline layers, and hard-edged light bands.

A stationary scanline texture covers the screen. Reduced motion hides this texture.

## Shapes

The cabinet, buttons, meters, status lights, and signs use rectangular geometry. Keycaps provide the small-radius exception, with a heavier bottom border. Inline SVG supplies interface icons.

The canvas uses crisp pixel scaling with image smoothing disabled. The renderer rounds primitive coordinates and builds sprites from rectangles and polygons.

## Components

### Arcade controls

- **Primary action:** A gold rectangle uses a bright border and centered pixel text. Minimum height is `49px`, reduced to `44px` on mobile.
- **Toolbar action:** A transparent button uses muted text and an inline icon. Hover turns yellow. A pressed sound toggle turns cyan.
- **Text action:** A borderless secondary action changes from muted to primary text on hover. Mobile padding becomes `12px`.
- **Touch action:** Panel-colored buttons use a minimum width of `55px`. Nitro uses yellow text and a translucent gold border. A held control gains a line-colored fill and cyan border.
- **Keyboard legend:** Keycaps use a `1px` border with a `3px` bottom edge. The wide Space key adds horizontal padding.
- **Focus:** Buttons, links, and the canvas use a `2px` cyan outline with `5px` offset. Toolbar buttons use an inset `-2px` offset.
- **Disabled state:** Controls use opacity `0.36` and a default cursor. Touch controls enable during countdown and play.

### Driver selection

A dark overlay pairs native radio choices with pixel portrait canvases.

- **Flow:** Start, retry, and new-run actions open the selector. The player selects DHH or Ryan before each new run. DHH is the default. The game restores the last confirmed driver when storage is available.
- **Native behavior:** The fieldset uses a shared radio group. Arrow keys change the choice. Enter or the named drive action confirms it. Back or Escape restores the prior screen.
- **Unselected state:** Cards use panel fill and a `2px` line-colored border. Hover changes the border to muted. Each card shows `SELECT`.
- **Selected state:** The checked card uses `driver-selected` fill and a `2px` Countach yellow border. Its name and `SELECTED` label turn yellow.
- **Focus:** A focused radio gives its card a `2px` cyan outline with `5px` offset. The selector focuses the checked radio when it opens.
- **Portraits:** The renderer draws `48` by `56` pixel canvases from cached smile sprites. DHH's `32` by `38` pixel back, profile, and smile sprites follow the supplied `~/dhh.jpg` photo. They show wavy chestnut-brown hair, blue-gray eyes, rosy cheeks, a short gray-flecked beard, and a broad smile. The selector pairs the label `Wavy hair and beard.` with the updated DHH smile sprite. Ryan follows the user-supplied reference with glasses, swept-back hair, a goatee, and colored shirt dots.
- **Surface:** The overlay uses `#16161ef2`, permits vertical scroll, and uses safe center alignment. Its base padding is `28px 24px 20px`. Cards use `16px 18px 14px` padding and `10px` internal gaps.

### Omarchy logo

The original Omarchy text-block logo connects the start screen and roadside signs.

The source asset is `assets/omarchy-logo.txt`. `src/omarchy-logo.js` draws the block characters into a canvas. `Renderer` caches the canvas for reuse on the start screen and roadside signs.

Logo pixels use `text`. The start-screen logo centers in the footer with width `clamp(84px, 14cqw, 180px)` and automatic height. Every third roadside sign shows the cached logo within a green rectangular border.

### Race instruments and state panels

The HUD keeps score left, time centered, and checkpoint distance right. Speed and gear sit below right. Nitro sits below left with a bordered track and left-origin fill.

The nitro meter changes from cyan to yellow during boost. Its text reports charge state, and its meter value updates accessibly. Time turns pink at ten seconds or less.

Pause and results use centered dark overlays with pink headings and a gold primary action. State changes focus the checked driver radio, canvas, resume action, retry action, or start action. Live announcements report major race events.

### Speed and boost cameo

Cruise targets `285 km/h`, gas targets `340 km/h`, and boost targets `460 km/h`. The renderer multiplies world travel by `1.85` to strengthen the sense of speed.

Speed lines start at `160 km/h` and intensify with speed. Boost adds exhaust flames and shifts focal length from `55` toward `42`, with interpolation factor `0.08` per frame.

The first boost of each run introduces the selected driver. Later boost onsets use a `35%` chance roll after the `20s` cooldown. Each cameo starts the cooldown. A held boost does not retrigger the cameo.

Both drivers use `cameoPose` for the same `2.6s` sequence. The head emerges over `0.4s`, turns to profile at `0.6s`, and smiles at `0.88s`. The selected driver's name tag appears from `0.95s` to `1.8s`. Return starts at `1.85s` and ends at `2.6s`. Early boost release advances the sequence to the return phase.

### Motion controls

Button color feedback uses `120ms ease-out`. Driver borders and backgrounds use the same duration and `ease-out` curve. `prefers-reduced-motion: reduce` removes these transitions, scanlines, title travel, speed lines, camera shake, car bounce, steering tilt, and collision flicker.

Reduced motion shows the selected driver's stationary smile after `0.15s` and before `2.25s`, without a head turn or hair wave. Road travel, exhaust, and gameplay remain active. The renderer responds when the preference changes.

The toolbar pause action, `P`, and `Escape` pause the simulation. Window blur and document visibility loss also pause the simulation.

## Do's and Don'ts

### Do:
- **Do** preserve the yellow Countach and behind-the-car pixel view.
- **Do** share the Tokyo Night palette between interface controls and procedural artwork.
- **Do** keep the full road width and visible touch controls through responsive and fullscreen states.
- **Do** preserve focus outlines, text-backed status, and reduced-motion behavior.
- **Do** preserve the supplied Omarchy text-block logo on the start screen and roadside signs.

### Don't:
- **Don't** smooth the pixel artwork or replace its hard-edged geometry with photographic imagery.
- **Don't** replace rectangular arcade controls with pill-shaped controls.
- **Don't** let skyline detail obscure checkpoint information.
- **Don't** repeat the cameo continuously during one held boost.
