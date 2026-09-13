---
version: 1
slug: "vr-html"
primary_target: "vr.html"
related_targets: ["vr.css", "src/vr-main.js", "src/vr-scene.js", "src/vr-controls.mjs", "src/vr-session.mjs", "src/vr-audio.js", "src/vr-panels.js", "src/vr-world.mjs", "src/song-player.js", "src/audio.js", "src/story.mjs", "src/vr-art.js", "src/renderer.js", "src/full-characters.js", "src/garage-scene.js", "src/pit-stops.mjs", "src/engine.mjs", "src/rocket.mjs", "src/rocket-art.js", "src/vr-rocket.js", "src/patrons.mjs", "src/patron-art.js"]
---

# VR race surface

## Scope

This surface uses Experience mode. The user confirms WebXR headsets and a seated cockpit with tracked controllers.
The primary action enters immersive VR. A screen mode provides the same 3D race without a headset.

The in-car radio uses the Omarchy Radio songs and shared playback state.
A physical stereo beside the instrument panel exposes controller-ray transport and volume actions.
Screen mode provides the same compact stereo and native track selector below the cockpit.

The user requests visible browser-game characters and complete visual parity in VR.
The garage shows the original nine characters and recognizable car artwork before the drive.
Voxel characters reuse the browser's full-body sprites, portraits, and cameo poses.
The drive includes a visible companion, selected-driver cameos, branded signs, pickups, and pit-stop characters.

## Direction contract

### THESIS

The player sits inside the car, with the expressway, traffic, and city in three dimensions.
Head movement reveals the cockpit and the surrounding city.

### OWN-WORLD

The established Tokyo Night palette, pixel type, and rectangular instruments extend into low-poly geometry.
The selected paint colors the hood and door frames. Cyan identifies controls and route information.

### STORY

The player enters VR, centers the seat, and starts the race from the cockpit menu.
The race retains traffic, checkpoints, nitro, and scores. Controller rays operate the menus.
Spatial traffic sound and controller pulses reinforce close passes and collisions.

The same four chapters provide briefings, objectives, marked pickups, failure reasons, and a final delivery at the Omarchy arcade.
The VR header and cockpit menus include a button to play or pause the supplied MP3 song.
The optional Omarchy rocket carries the selected car to Mars after twenty active seconds.
The level cockpit frames the cargo cabin, space flight, and Mars outpost. A headset action returns to the same Tokyo campaign.
Randomized founding-patron displays reuse the local pixel portraits from the arcade on roadside signs and garage or outpost walls.

### FIRST VIEWPORT

A compact setup panel sits left of the full-viewport garage on desktop.
The garage presents the nine voxel characters, nine car models, and the browser game's original artwork.
Mobile places the panel below the garage preview. Selected-driver and car canvases make both choices visible within the panel.
The dashboard carries speed, time, charge, and checkpoint distance in the headset.

### FORM

The confirmed seated WebXR cockpit extends the established direction from seed `6ddbd526`.
This code-led addition uses local Three.js modules and the existing race engine.
The cockpit remains level. Head tracking controls the view without camera shake or boost zoom.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implemented surface

### Entry and recovery

- `index.html` links to `vr.html` through `VR COCKPIT`. The VR header links back to the arcade.
- `EXPLORE RETRO ROOM` and the headset's `RETRO ROOM` action open `club.html`. The headset action pauses the song and exits XR before navigation.
- Local Three.js modules render stereo WebXR through an `immersive-vr` session. The route requires WebGL2.
- WebXR requires HTTPS or localhost on the host device. Unsupported browsers retain `DRIVE ON SCREEN` when WebGL2 is available.
- `ENTER VR` opens the headset request. The race starts from the cockpit menu after a chapter briefing and `BEGIN CHAPTER`.
- Seat centering uses a `local` reference space and `SEAT_HEIGHT` of `1.18`. It aligns position and yaw with the cockpit.
- Permission denial permits another entry attempt. Graphics failure presents a reload or return-to-arcade message.
- Visibility or tracking loss pauses an active drive. Session exit pauses the drive, resets the screen view, and permits screen resume or VR re-entry.

### Original art and garage

- `VRArt` reuses `Renderer.getFullCharacter`, the three face poses for all nine drivers, original car sprites, the garage facade, block logos, and pixel signs.
- The initial view shows nine voxel characters and nine model-specific 3D cars. The selected car occupies the central bay in the selected paint.
- Controller rays select crew members and cars on trigger press. Screen clicks use the same selection actions when pointer travel remains below `5px`.
- Crew and car choices apply in `title`, `gameover`, and `complete` states. Native selects update the same choices and preview art.
- `GARAGE` and `COCKPIT` buttons name the destination view. The toolbar sets `aria-pressed="true"` while the garage is active.
- A garage switch during countdown or play pauses the drive. `BEGIN CHAPTER` and resume actions return to the cockpit.
- The headset toggle appears in setup, pause, and results menus. Its button occupies `172 × 54` texture pixels at `[804, 24]`.
- The headset setup cells include an original driver face, car rear sprite, and paint swatch beside their labels.
- Native setup displays full-body and car preview canvases with captions and updated image labels. It hides these previews in `story`, `paused`, `pit`, `pit-enter`, and `ending` states.
- The garage uses the original Omarchy facade. Roadside signs reuse both Omarchy and Cliamp block logos and the browser renderer's pixel glyphs.
- Non-van traffic carries original car rear textures over procedural geometry.
- The seated driver has a visible body. The next roster member occupies the passenger seat, and the mirror includes both occupants.
- The driver's head uses mirror-only layer `3` inside the seat. The cameo makes it visible in the main view when its lift exceeds `0.65`.
- `cameoPose` supplies the original back, profile, and smile poses. The avatar leans out of the window with the original greeting interval.
- Reduced motion selects the smile pose, removes idle head motion, and fixes exhaust length. The preference updates during play.
- All nine voxel characters stand at the final arcade in the `ending` and `complete` states.

### Campaign and controls

- Chapter one requires a cassette. Chapter two requires two power cells. Chapter three requires six overtakes. Chapter four permits at most two collisions.
- Chapter menus show the chapter title, district, story text, and objective. Failure menus show `game.failureReason`.
- Pink cassette and green power-cell geometry sit within cyan frames above green road markers.
- Dashboard and screen readouts show mission progress and the next unresolved pickup's left, right, or center lane.
- The ending shows the Omarchy arcade, the delivery message, and final results. `ONE MORE RUN` opens a new chapter briefing.
- Setup reuses the existing driver, car, and paint choices. The selected paint colors the hood and door frames.
- The left thumbstick steers. The right trigger accelerates, and the left trigger brakes. Grip-wheel mode uses both controller grips and their relative positions.
- The right lower face button holds nitro. The right upper button pauses or resumes. The left lower button centers the seat, and the upper button toggles comfort.
- Controller rays select spatial buttons on trigger press. A standard gamepad also supports the race and menu confirmation.
- Screen controls support arrow keys or WASD, Space or Shift for nitro, `P` or Escape for pause, and `R` for center.
- Pointer drag changes the screen view. Four touch controls provide left, right, brake, and nitro actions.
- Spatial engine and traffic audio uses HRTF panners. Supported controllers pulse for collisions, near misses, checkpoints, and pickups.
- Cyan nitro pickups accompany the chapter pickups. A collection event also pulses supported controllers.
- Optional pit areas use green bay edges, a `PIT STOP` sign, and a cyan shoulder instruction. Nearby guardrail segments leave an opening.
- Dashboard and screen mission text identify the pit side within `350` engine-distance units. Two crew members stand beside an approaching pit area.
- Pit entry slows the car before the conversation. Both participants appear as voxel characters, and the headset panel shows the current speaker's original full-body art.
- `CONTINUE` advances the dialogue. The final `BACK TO RACE` action resumes the run with full nitro. Song and exit controls remain available.

### Rocket and patron extension

The rocket flight visits every native Omarchy palette through instanced star trails, segmented rings, and cargo-cabin light.
The dashboard names the current theme and displays its full color strip.
The shared star soundtrack follows the active flight clock, sound preference, pause, and resume.
The level cockpit uses bounded instanced geometry. Reduced motion fixes the star and ring positions while the palette changes.

The theme snapshot contains 22 native palettes. Each flight interval lasts `20 / 22` seconds and blends during its first `40%`.
The dashboard shows the theme name and exact source color strip above flight progress.
The cargo cabin uses isolated materials so its theme colors do not alter the roadside rocket or Mars outpost.
Rings use 28 fixed color-role slots. VR draws three rings with comfort or reduced motion, and five otherwise.
The Sound control enables the shared stereo soundtrack. The MP3 takes precedence while it plays.
The mobile rocket viewport fills the available race height.

`vr-rocket-headset.png` and `vr-rocket-light-headset.png` in `.impeccable/review/` show both palette modes with readable instruments.
The headset flight check observes every native theme. The reduced-motion check compares unchanged star and ring matrices across all 22 palettes.

The cockpit now includes a physical Omarchy Radio stereo at `[0.9, 0.94, -1]`, beside the primary dashboard.
Its `768 × 320` texture occupies a `0.74 × 0.308` plane with `-0.12` X rotation.
The controller rays select previous, play or pause, next, and five-percent volume steps.
The panel shows the shared track title, artist, state, count, volume, and time.
Screen controls use the same radio state below the cockpit. The chrome measurement includes their current height.
Headset visibility loss pauses radio playback. The local MP3 and radio use exclusive playback.
`tests/browser/vr.spec.js` verifies stereo controls through actual IWER controller rays.
`.impeccable/review/radio-headset.png` records the physical stereo. `radio-vr-desktop.png` records its native controls.

- The optional Omarchy rocket uses a cyan right-shoulder ramp `850m` into each chapter until visited. A road-lane pass continues the race.
- The selected car, driver, and paint carry into the flight. `VRRocket` supplies the cargo cabin, space flight, and Mars outpost.
- The shared sequence uses `0–2s` for cargo closure, `2–6s` for launch, `6–16s` for hyper boost, and `16–20s` for Mars approach.
- The level cockpit retains head control. Its existing dashboard shows phase, thrust, ETA, progress, and `MENU` during flight.
- Screen telemetry reuses `.vr-readouts`. The garage toggle disables during flight and Mars, and the pause menu shows `FLIGHT PAUSED.`.
- Pause freezes flight time. The race timer, distance, lane, and mission progress remain fixed throughout the flight and Mars visit.
- Arrival awards one `5000`-point bonus per run. The gold `RETURN TO TOKYO` action resumes the same campaign with full nitro.
- Reduced motion uses stationary short star marks. Comfort view shortens moving flight streaks.
- `patronRandom` selects the cosmetic tour independently of game randomness. All twelve roadside IDs use the shared spacing and random-side rules.
- Three garage selections and two Mars selections use distinct IDs from the shuffled deck. The arcade Mars scene uses the first Mars selection.
- `VRArt.patronTexture` caches each `160 × 88` nameplate. Both filters use `NearestFilter`, with no mipmaps, and portrait decode refreshes the texture.
- The nameplates reuse local `48 × 48` palette-mapped PNGs. Missing portraits retain initials, names, companies, and source text.

### Layout and spatial materials

- The desktop setup panel measures `416px` wide, with `32px` left margin and `30px 28px 24px` padding.
- At widths up to `760px`, the panel follows a `36dvh` preview with a `230px` minimum height. The panel uses `24px` padding.
- The preview row uses `100px 1fr` columns, a `20px` gap, `12px 0` padding, and a `24px` bottom margin. Line-colored borders frame its top and bottom.
- The character canvas uses `48 × 104` source pixels and the same CSS dimensions. The `112 × 72` car canvas displays at `168 × 108px`.
- Preview captions use yellow `12px` Courier New with line height `1.5`. Figure contents use `10px` gaps and centered captions.
- Mobile toolbar controls wrap with `0 8px` gaps. `updateChrome` measures the header, footer, and song notice into `--vr-chrome`.
- Race height subtracts `--vr-chrome` from `100dvh`. CSS fallback values are `120px` on desktop and `152px` on mobile.
- Voxel characters derive from `48 × 104` full-body sprites at a standing height of `1.68` world units. Head, torso, and leg parts permit seated poses.
- The original garage facade uses a `768 × 240` texture on a `22.4 × 7` world-unit plane at `[0, 3.5, -18]`.
- The selected garage car sits at `[0, 0, -5.4]`. Four cars on each side use horizontal offsets of `5.7` and depth intervals of `3.8` world units.
- Spatial name tags use `384 × 72` textures on `1 × 0.1875` world-unit planes. Crew tags use yellow, and car tags use cyan.
- `VRArt` textures use nearest-neighbor minification and magnification without mipmaps. This preserves the source pixels on cars, signs, and the garage facade.
- Cockpit panels use `bg`, `line`, and the established Tokyo Night accents. Arcade supplies primary actions and instrument values. Courier New supplies supporting text.
- The dashboard uses a `1024 × 256` canvas on a `0.96 × 0.24` world-unit plane at `[0, 0.94, -0.87]`.
- The finish review requires all dashboard instrument values and `MENU` to fit the neutral stereo view.
- The menu uses a `1024 × 768` canvas on a `2 × 1.5` world-unit plane at `[-0.2, 1.56, -2.6]`.
- The message panel uses a `1024 × 160` canvas on a `2.5 × 0.39` world-unit plane at `[0, 1.55, -3.2]`.
- Dashboard speed uses `78px` Arcade text in the texture. Time and distance use `60px`. These values describe texture pixels, not CSS pixels.
- Gold identifies spatial primary actions. Secondary buttons use panel fill. Controller hover adds a `4px` cyan stroke and brightens the fill.
- The cockpit remains level. Comfort view defaults to enabled and darkens peripheral motion above `130 km/h`, with strength capped at `0.9`.
- `WORLD_SCALE` is `0.5`, and `ROAD_HALF_WIDTH` is `5`. The screen camera uses a `72` degree field of view. WebXR supplies headset projection.
- Procedural geometry, distance fog, and a rear-view mirror establish depth. The mirror refreshes at most ten times per second.
- The ground uses `renderOrder = -20`, and the road uses `renderOrder = -10`. Both use `depthWrite = false` to protect cockpit instruments in stereo.
- The pit dialogue draws the speaker at `[786, 262]` with a `128 × 277` image in the menu texture. Dialogue uses `30px` Courier New within `680px` width.
- The pit surface measures `6.4 × 18` world units. Road segments within `18` world units of its center omit the guardrail on the pit side.

- Patron signs use `3.8 × 2.09` world-unit planes. Garage signs sit at `x = -6.8, 0, 6.8`, `y = 4.4`, and `z = -15.5`.
- Within the rocket scene, the Mars outpost center is `[12, 2.8, -18]`.
- Its two posters sit at `[9.3, 1.4, -13.85]` and `[14.7, 1.4, -13.85]`.
- The Mars menu says `PATRON DISPLAYS · LOOK RIGHT` in cyan `26px` Courier New at `[48, 372]` texture pixels.
- The `0.7rad` right-turn IWER capture shows both complete posters below the mirror, clear of the pillars and menu.

### Simulation timing

- Outside `rocket-flight`, `src/vr-main.js` passes each elapsed frame delta to `advanceVRSimulation` in `src/vr-world.mjs`.
- The adapter accepts at most `0.25s` per frame. It processes steps of at most `1/60s` and includes the final smaller step.
- This preserves elapsed time within the frame limit across render rates. Non-finite and negative deltas do not advance the engine.
- Focus and session transitions reset the frame timestamp to avoid catch-up after an interruption.
- Rocket flight passes the full active frame delta directly to `GameEngine.update`. Its twenty-second clock bypasses race frame limits and substeps.

### MP3 song behavior

- `src/song-player.js` loads `assets/omarchy-tokyo-nights.mp3` with `preload="none"` and volume `0.65`. The song starts after a song action.
- `PLAY SONG` starts or resumes the track. `PAUSE SONG` retains its position. A play action after the track ends restarts it.
- The DOM button shows `LOAD SONG` during a pending request. Its accessible name becomes `Cancel song load`, and a second action cancels it.
- Cockpit menus expose `CANCEL SONG LOAD`. Pending and error text stays visible in setup, pause, failure, chapter, and delivery menus.
- The drive message panel points to the menu for cancellation or retry when the song request remains pending or fails.
- DOM song controls expose `aria-pressed`, an accessible action name, and a `role="status"` message for pending requests or errors.
- The MP3 works independently of `SOUND`. `src/audio.js` suppresses the synthesized tune while the MP3 plays and retains enabled race effects.
- Screen focus loss and VR visibility or tracking loss pause the song. The player uses the song action to resume it.

## Verification evidence

### Earlier VR handoff

- `tests/browser/vr.spec.js` includes stereo IWER emulation, controller menus, song controls, visibility pause, permission retry, exit, and re-entry.
- The same test file covers screen mode, mobile touch controls, blocked storage, reduced motion, graphics failure, delivery results, and failure feedback.
- The delivery test prepares the final chapter near its endpoint. It does not drive all four chapters in a physical headset.
- `tests/browser/song-player.spec.js` covers MP3 start, pause, resume, focus loss, request failure, and cancellation across the relevant routes.
- `tests/vr.test.mjs` covers controller input, grip calibration, seat offsets, optional haptics, session lifecycle, and local route assets.
- Its render-rate test compares race time and distance after seven seconds at `60` updates per second and `0.2s` frame intervals.
- `tests/browser/vr.spec.js` includes visible garage selection, the boost cameo, the passenger view, and a prepared pit conversation with return to the race.
- `.impeccable/review/vr-desktop.png` and `.impeccable/review/vr-mobile.png` show the garage, original car art, and native setup previews.
- `.impeccable/review/vr-garage-headset.png` shows the stereo garage with crew, cars, and the textured setup menu.
- `.impeccable/review/vr-headset-cameo.png` and `.impeccable/review/vr-companion.png` show the driver cameo, passenger, and mirror artwork.
- **Earlier finish review:** The recorded disposition is `ship` for the browser and IWER scope. That review covers the 11 earlier captures.
- The captures confirm original-art garage crew and cars, the selected-driver cameo, companion and mirror, and neutral stereo instruments. They also confirm pit and failure states and MP3 controls.
- The earlier suite records 50 simulation checks and 37 browser checks passed. Its focused cameo capture test also passes.
- The capture test replaces an arbitrary sleep with a test-only engine wrapper. It holds an observed `cameoTime` between `1` and `1.7` for the screenshot, then restores the original update function. Production code has no freeze hook.
- These test definitions cover browser and emulated-headset behavior. Physical headset comfort, performance, audio, and controller feel remain unverified.

### Rocket and patron extension evidence

- `.impeccable/review/vr-rocket-headset.png` shows stereo hyper boost with phase, thrust, ETA, progress, and `MENU`.
- `.impeccable/review/vr-mars-headset.png` shows the arrival menu, bonus, return action, and right-look instruction in the neutral view.
- `.impeccable/review/vr-mars-patrons.png` shows both complete outpost posters after a `0.7rad` right head turn.
- `tests/browser/vr.spec.js` exercises controller entry, flight pause, twenty-second arrival, retained campaign state and car choices, and return with full nitro.
- The supplied results report all four rocket browser checks passed again after both fixes, including this headset case. All five patron checks also pass.
- `.impeccable/surfaces/index-html.md` records the current `72` unit checks and the full browser suite's `50/51` result with its targeted rerun.

The initial extension review identifies two material findings: the covered mobile rocket ramp and obscured VR Mars posters.
The verdict pass marks both resolved at `10/10`, with disposition `ship`.
The verdict covers only those two fixes at desktop, mobile, and IWER scope.
It does not replace the earlier whole-surface review. Physical headset tests are outside the extension scope.
