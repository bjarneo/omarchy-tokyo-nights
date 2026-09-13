---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["style.css","src/main.js","src/renderer.js","src/engine.mjs","src/rocket.mjs","src/rocket-art.js","src/patrons.mjs","src/patron-art.js"]
---

# Arcade surface

## Scope

The `index.html` surface uses Experience mode. The primary action starts the race.
The user confirms a behind-the-car arcade view and a self-contained browser game.

The user requests an in-car radio with the community songs from radio.omarchy.org.
A compact stereo below the road exposes transport controls and a track readout. TUNE opens native track and volume controls.
The local catalog retains source titles and artists. Audio streams from the station after a playback action.
The radio and local MP3 use exclusive playback. Sound effects retain their existing control.

## Direction contract

### THESIS

An after-hours arcade cabinet opens directly onto a pixel-art Tokyo expressway.
The game itself occupies the first viewport.

### OWN-WORLD

Tokyo Night indigo grounds support pink signs, blue skylines, and a yellow Lamborghini.
Pixel lettering, rectangular controls, lane markers, and instrument readouts form one arcade language.

### STORY

The player chooses from nine drivers, nine cars, and nine paint colors before a four-chapter campaign.
The player collects a tape and power cells, passes traffic, and reaches the Omarchy arcade before sunrise.
Chapter briefings state each objective. The final arrival scene and completion screen close the story.
Nitro creates the signature moment through exhaust flames, speed lines, and a higher engine pitch.
The user requests faster travel and a stronger sense of acceleration.
Occasional boosts trigger the selected driver's cameo. The character emerges, turns toward the player, smiles, and returns inside the car.
The first boost introduces the character. Later cameos use a cooldown and a chance roll.
Nitro lasts eight seconds per tank, with blue canisters available along the route.
Green roadside pit bays appear at random locations. Deliberate entry transitions to a full-body conversation about verified Omarchy topics.
Driving past a bay continues the race without an interruption.
The conversation pauses the clock and returns to the same lane and distance with a refilled tank.
The optional Omarchy rocket accepts the selected car through a cyan shoulder ramp.
The twenty-second flight shows cargo closure, liftoff, hyper boost, and Mars approach before arrival at the outpost.
Pause stops flight time. The return action resumes the same Tokyo campaign.
Twelve verified founding patrons appear on randomized roadside portrait signs and garage or Mars displays.
Local pixel portraits and nameplates inherit the scene's hard edges. Each new run changes their order and roadside positions.
The selector uses pixel portraits and native radio controls. Ryan's portrait follows the supplied photo's glasses, swept-back hair, and goatee.
DHH's portrait follows the supplied photo's wavy brown hair, blue-gray eyes, short beard, and broad smile.

### FIRST VIEWPORT

A narrow identity strip sits above a large, crisp 16:9 game canvas.
The title sits above the skyline and road, with the yellow car centered below it.
A yellow start control sits within reach above a concise keyboard control strip.
The original Omarchy block logo sits below the car on the start screen and appears on roadside signs.
All nine character sprites form a lineup at the lower-right of the start screen.
The lineup links to the larger garage page.
Cliamp advertisements use its block wordmark, spectrum bars, and verified site address.
Mobile places touch controls below the canvas and preserves the full road width.

### FORM

The user's confirmed pixel-art arcade direction overrides the open-world assignment from seed `6ddbd526`.
The build uses code-led, interactive 2D canvas graphics.
The skyline, road projection, car sprites, signs, and particle effects use original procedural artwork.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implemented rocket and patron extension

### Compatibility

The extension follows the Shared Palette Rule and Instrument Type Rule in `DESIGN.md`.
`style.css` reuses cyan telemetry, yellow actions, pink state headings, dark panels, and the existing focus and pause controls.
The Outfoxxed shirt uses the existing `blue` token in cameo and full-body artwork.
Local patron portraits occupy pixel nameplates within the procedural scene.

### Rocket entry and flight

The user requests all native Omarchy theme colors and star music during the rocket flight.
The focal sequence visits each native palette once over twenty active seconds through colored star trails and segmented light rings.
Theme names and full color strips identify each palette. Smooth color blends connect the steps.
An original stereo chime melody and soft synth chords follow the same flight clock and existing sound preference.
Pause stops both sequences. Reduced motion keeps the color sequence with stationary stars and rings.
The renderer uses bounded Canvas geometry. The audio engine caches one twenty-second stereo buffer.

- `prepareRocket` places the optional right-shoulder pad `850m` into each chapter until the rocket visit.
- A road-lane pass continues the race. Deliberate entry into the cyan ramp boards the selected car and retains the driver and paint.
- `src/rocket.mjs` supplies the shared phase labels. The flight uses twenty active seconds.

| Active flight time | Phase | Visible label |
| --- | --- | --- |
| `0–2s` | Cargo closure | `CARGO BAY CLOSING` |
| `2–6s` | Launch | `OMARCHY LIFTOFF` |
| `6–16s` | Hyper boost | `HYPER BOOST` |
| `16–20s` | Mars approach | `MARS APPROACH` |

- Flight telemetry replaces the race HUD with phase, ETA, thrust, and a progressbar from `0` to `20` seconds.
- Both frame loops pass the active flight delta directly to the engine. Race frame limits do not shorten the flight clock.
- Pause freezes `rocketTime`. The arcade pause panel shows `FLIGHT PAUSED.` and `RESUME FLIGHT`.
- Race time, distance, lane, and mission progress remain fixed throughout the flight and Mars visit.
- Mars arrival adds `5000` points once per run. The return action receives focus and resumes the same campaign with full nitro.
- Reduced motion retains the full sequence while removing rocket vibration, moving star streaks, and exhaust pulse.

### Mobile ramp and arrival panel

At widths up to `700px`, `.rocket-pad-indicator` hides the duplicate label over the scene.
The existing bottom status strip retains `ROCKET RIGHT · DRIVE INTO THE CYAN RAMP`.
The mobile capture shows the exposed cyan ramp with the race touch controls below the cabinet.

Mobile telemetry uses `6px` gaps and padding, `12px` phase text, and an `18px` ETA.
The Mars screen uses `460px` height and a bottom panel with `16px` padding.
`RETURN TO TOKYO` reuses `button-primary`. Flight and Mars states hide the race touch controls and keyboard strip.

### Patron tour

- `src/patrons.mjs` records twelve official individual founding patrons from `https://omarchy.org/patrons/`.
- `createPatronTour` shuffles all twelve IDs through the separate `patronRandom` source. Cosmetic choices do not change game randomness.
- Roadside positions use `300 + index * 950 + Math.floor(random() * 250)` meters, with zero-based indices and independently selected sides.
- The first three shuffled IDs supply garage displays. The next two supply VR Mars displays, so these five IDs are distinct.
- The arcade Mars outpost uses `patronTour.mars[0]`. Pause and the Mars trip retain the same tour. A new run creates another tour.
- `src/patron-art.js` caches `160 × 88` nameplates with `48 × 48` local palette-mapped PNG portraits.
- Failed portrait decode retains initials, names, companies, and source text. Each portrait PNG embeds its official source and conversion provenance.

## Extension verification evidence

### Current captures

Desktop fixtures use a `1440 × 1000` viewport. Mobile fixtures use `390 × 844`.

- `.impeccable/review/rocket-pad-desktop.png` shows the rocket, ramp, and desktop indicator.
- `.impeccable/review/rocket-pad-mobile.png` shows the exposed ramp and retained bottom status instruction.
- `.impeccable/review/rocket-boost-desktop.png` shows the selected car inside the rocket and flight telemetry.
- `.impeccable/review/rocket-boost-mobile.png` shows the compact flight HUD.
- `.impeccable/review/patrons-road-desktop.png` and `.impeccable/review/patrons-road-mobile.png` show projected roadside nameplates.
- `.impeccable/review/patrons-mars-desktop.png` and `.impeccable/review/patrons-mars-mobile.png` show the single arcade outpost display and return panel.
- `.impeccable/review/patrons-atlas.png` shows all twelve local portrait nameplates.
- `.impeccable/surfaces/garage-html.md` records the two garage captures. `.impeccable/surfaces/vr-html.md` records the three IWER captures.

### Supplied finish results

The initial finish review identifies two material findings: the covered mobile ramp and obscured VR Mars posters.
The verdict pass marks both findings resolved at `10/10`, with disposition `ship`.
This verdict covers only those two fixes at desktop, mobile, and IWER scope.
It is not a fresh whole-surface review. Physical headset tests are outside scope.

- The latest unit suite reports `72` checks passed.
- The full browser suite reports `50/51` passes. The concurrent Retro Room mobile failure passes on a targeted rerun against current code.
- All four rocket browser checks pass again after both fixes, including headset timing, pause, and return.
- All five patron browser checks pass.
- The raster scan reports `21` PNG assets and `0` missing provenance records.

`tests/rocket.test.mjs` covers optional entry, timing, pause, retained campaign state, and the single bonus.
`tests/patrons.test.mjs` covers tour uniqueness, independent randomness, tour retention, local asset dimensions, and provenance.
Browser fixtures move the rocket or a patron sign closer for bounded checks. Patron fixtures prepare Mars directly.
The headset rocket case in `tests/browser/vr.spec.js` exercises the timed flight and return through IWER.

Existing detector advisories cover keycap borders and radius, static evaluation of hidden or container-unit small text, and old token-ramp or color drift.
Scanlines and the cabinet shadow remain intentional treatments. These advisories do not define new extension tokens or rules.

## Native theme flight and star soundtrack

The native snapshot contains all 22 tracked Omarchy theme palettes from revision `760a546a1c883d9bf3f33e3675920318fbf3fe76`.
`assets/omarchy-themes.js` retains scalar colors and border-gradient RGB endpoints. Its source revision makes the snapshot reproducible.
The shared theme clock gives each palette `20 / 22` seconds, with cubic ease-out over the first `40%` of each interval.
Hull colors resolve their dark or light roles before interpolation. A fixed union of 28 roles preserves star and ring continuity.

The palette indicator follows the phase label. It shows the theme name, sequence position, and all source colors.
The indicator uses existing Courier text, dark instrument panels, and an `8px` color strip with `1px` gaps.
Mobile flight uses a `460px` scene. Short touch landscape uses `calc(100dvh - 74px)`.

The original soundtrack gives each theme four chime notes, with synth chords, bass, stereo pan, and reverb.
Web Audio creates and caches one twenty-second stereo buffer.
Sound, pause, resume, focus, and the MP3 control govern playback. Resume aligns the buffer offset with flight time.

### Verification

- The complete unit suite passes `82` checks. The four native-theme checks pass again after the fixed-role correction.
- All seven focused rocket browser checks pass after the correction. The earlier game, song, and VR regression run passes `24` checks.
- The headset case observes all 22 themes during the real timed flight. Reduced-motion checks compare star and ring matrices across every palette.
- PCM checks verify twenty-second stereo output, audible RMS, bounded peaks, stereo separation, and quiet endpoints.
- `rocket-native-themes-atlas.png` shows all 22 rendered palettes. Dark and light desktop, mobile, narrow, landscape, and stereo captures verify the instruments.
- Captures reside in `.impeccable/review/`. The landscape capture uses the actual viewport because full-page capture resets Chromium touch emulation.

The independent review agent is unavailable. The inline fallback identifies a palette-length change that shifts reduced-motion ring segments.
The fixed color-role grid resolves that finding. The fallback verdict is `ship` for this correction, with source and matrix evidence for motion.
The documentation fallback records the native-palette exception, indicator, motion, and audio behavior in the existing design system.

## Car radio

The stereo sits below the road inside the cabinet. It exposes play, pause, previous, next, and TUNE controls.
TUNE reveals the native track selector and volume slider. The readout retains song titles, artists, track position, and playback state.
The catalog contains 33 verified tracks from `https://radio.omarchy.org/tracks/playlist.json`.
Audio loads from the station after a playback action. The local catalog supports initial UI display without external requests.

The radio preserves its paused position and advances when a song ends. The playlist wraps after the last song.
The selected track and volume persist under `tokyo-nights.radio.track` and `tokyo-nights.radio.volume`.
Radio and MP3 playback exclude each other. Either media source takes precedence over synthesized music.
Focus loss cancels pending requests and pauses the radio. Failed requests expose Play and Next recovery actions.

Fullscreen includes the measured radio height. The compact layout keeps transport available beside the track title.
Radio form keys do not steer the car or trigger nitro.

The radio browser checks cover selection, playback, automatic advance, cancellation, errors, retry, volume, persistence, blocked storage, and subpath hosting.
Desktop, mobile, and fullscreen captures reside in `.impeccable/review/radio-arcade-desktop.png`, `radio-arcade-mobile.png`, and `radio-fullscreen-mobile.png`.
The mobile capture uses the viewport to preserve Chromium touch emulation.
The live-source check plays the station's first MP3 and reports elapsed playback with no media error.
