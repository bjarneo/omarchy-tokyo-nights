---
version: 1
slug: "club-html"
primary_target: "club.html"
related_targets: ["club.css", "src/club-main.js", "src/club-scene.js", "src/club-room.js", "src/club-screens.js", "src/club-engine.mjs", "src/club-data.mjs", "src/club-controls.mjs", "src/club-games.mjs", "src/club-audio.js", "src/club-avatars.js", "src/club-motion.mjs", "src/club-logo-wall.js", "src/club-jukebox.mjs", "src/club-cinema.js", "src/club-security.mjs", "src/club-security-art.js", "src/club-security-room.js", "src/club-security-screen.js", "src/club-design.mjs", "src/club-design-art.js", "src/club-design-room.js", "src/club-mac.mjs", "src/club-mac-room.js", "src/club-mac-screen.js", "src/club-team-art.js", "src/vr-session.mjs", "src/vr-art.js", "src/song-player.js"]
---

# Retro clubhouse

## Scope

This surface uses Experience mode. The user requests a large 1980s computer and console room with the existing cameo characters.
The user selects smooth walk plus teleport and free exploration without a main objective.
The implementation provides 30-degree snap turns and both WebXR and screen controls.
The user requests the original Omarchy logo on the club wall and a prominent club link on the game page.
The user also requests individual character gestures, a coffee-drink animation, short walks, and the player's standing scale.

The extension adds original project marks, a local Omarchy Radio jukebox, and a large lounge cinema CRT.
The user approves official YouTube playback in the browser after XR ends.
This ordinary extension preserves the established Tokyo Night identity, tokens, and direction contract.

### Malibu desk addition

The user approves a walk-up 3D recreation of the supplied `early-malibu.jpg` reference.
A sculpted white loop desk, silver monitor, dark mesh chair, and tabletop objects occupy the northeast Amiga corner.
Two tall glazed walls frame a layered coastal sunrise. Pale wood flooring and restrained warm light distinguish this corner.
The curved desk silhouette and wraparound view carry the photograph's identity within the existing 3D room.
The room map provides direct access. The monitor offers a local desktop and coastal wallpaper.

Reference: https://world.hey.com/dhh/baefaf09/representations/eyJfcmFpbHMiOnsiZGF0YSI6MTExMTUxODU0MCwicHVyIjoiYmxvYl9pZCJ9fQ--3239074e8fbf1c8170c3478d039bf0d22fe53ca6887b7d534c79aae8d27d3ce5/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fbGltaXQiOlszODQwLDI1NjBdLCJxdWFsaXR5Ijo2MCwibG9hZGVyIjp7InBhZ2UiOm51bGx9LCJjb2FsZXNjZSI6dHJ1ZX0sInB1ciI6InZhcmlhdGlvbiJ9fQ--b3779d742b3242a2a5284869a45b2a113e0c177f0450c29f0baca1ee780f6604/early-malibu.jpg

### Security room addition

The user approves a full security lab through an open doorway beside the entrance.
The extension preserves the existing voxel art, Tokyo Night palette, and shared screen and WebXR controls.
A separate `18 × 14m` room extends south from the main club.
Red-team and blue-team illustrated walls face a central patrol area for an animated pixel-virus creature.
Five benches provide local pentest, zero-day, incident-response, forensics, and reverse-engineering exercises.
Five walk-up cameos use the names and countries from `https://omarchy.org/teams/`.
Their original pixel portraits use the official team photos as visual references. Their dialogue uses fictional club scripts.
The map adds a security destination. The doorway frames the command board, crew, and virus patrol on entry.
The virus supports quarantine and release. Reduced motion stops its patrol and idle motion.

## Direction contract

### Design studio extension

The user approves a separate retro studio with five design team cameos, wall art, and live creative desks.
An `18 × 14m` room extends southeast from the club through its own open doorway.
Paper-colored furniture, cork flooring, sample sheets, and a central easel distinguish the studio within the established Tokyo Night world.
The entrance frames a large live poster. Palette, typography, layout, icon, and motion controls update that poster and the desk screens.
Five original voxel cameos use the official design team names, countries, and photo references from `https://omarchy.org/teams/`.
The native and WebXR interfaces share the creative state. A ninth map destination provides direct access.
This code-led extension inherits seed `6ddbd526` and the existing Experience contract.

### Mac room extension

The user approves a Mac hardware lab with all 15 M-team cameos and the original Omarchy logo.
The `24 × 18m` room connects through the design studio’s east wall and adds a tenth map destination.
Aluminum workstations, colorful iMac cases, and classic beige Macs face broad open aisles.
A large original Omarchy block logo anchors the east wall. Three team boards show all 15 public names and countries.
Seven Mac models offer local desktop, terminal, and hardware-card demos through the existing native and spatial controls.
Original voxel cameos follow the official profile references. Landscape profile images become illustrated avatar heads.
This code-led Experience extension inherits seed `6ddbd526`, the shared movement model, and the Tokyo Night interface.

### THESIS

A 36-by-28-meter computer club places people, old hardware, and playable demos within a continuous walkable interior.
The player approaches the characters and machines directly.

### OWN-WORLD

The existing voxel characters and pixel lettering join beige computers, curved CRTs, wood furniture, patterned carpet, and Tokyo Night instrument colors.
Warm overhead lights and colored monitor faces establish a late-night 1989 club.

### STORY

The player explores freely, talks to all nine characters, changes computer demos, and plays original cabinet games.
The room includes Amiga, Commodore, Atari, Apple, IBM, Nintendo, and Sega hardware.

### FIRST VIEWPORT

The doorway opens onto a large furnished room with a nearby host and visible computer and console areas.
A compact entry panel offers WebXR and screen play. It disappears when exploration starts.
Talk panels sit beside characters, and native HTML panels expose the same actions.
Mobile places a `30dvh` room preview above the entry card, with a `230px` minimum preview height.

### FORM

The user specifies the retro computer-club form. This code-led extension inherits the established world from seed `6ddbd526`.
Controller movement and physical interactions provide the signature experience.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implemented surface

### Entry and navigation

- The game page links to `club.html` through the `THE CLUB` masthead link, `RETRO ROOM` toolbar link, and `.club-visit` banner.
- The banner shows `THE MIDNIGHT COMPUTER CLUB`, a short invitation, and `ENTER CLUB` with an inline SVG arrow.
- The banner uses panel fill, a thin line-colored border, `18px 20px` padding, and a `24px` gap. Hover turns its border cyan.
- At widths up to `700px`, the banner stacks with `16px` padding and a `12px` gap. Fullscreen and driver selection hide it.
- VR setup provides the native `EXPLORE RETRO ROOM` link. Headset menus provide the `RETRO ROOM` portal.
- The arcade toolbar becomes compact at container widths up to `900px`. At widths up to `380px`, it hides route text.
- `ENTER VR` requests stereo `immersive-vr`. `EXPLORE ON SCREEN` starts the same room with keyboard, pointer, touch, or standard gamepad controls.
- WebGL2 renders the room. WebXR requires HTTPS or localhost on the host device.
- Unsupported XR retains screen exploration when WebGL2 works. Permission denial permits another entry attempt.
- Graphics failure disables entry and provides a WebGL2 or reload message.
- The club header, pause menu, and Tokyo Nights cabinet provide routes to `vr.html`, which contains the race and garage.
- `openRace` pauses the original song and jukebox, cancels speech, and exits an active XR session before navigation.
- The room starts in `entry`. Other states are `explore`, `talk`, `device`, `arcade`, `sketch`, `map`, and `paused`.
- Jukebox and cinema menus use `device`. The browser cinema dialog opens over the paused room.
- `.github/workflows/deploy.yml` packages `club.html`, `club.css`, `src/`, and `assets/` for GitHub Pages.

### Room and station inventory

The room measures `36 × 28m` with a `4.6m` ceiling.
Six areas share open central aisles, lab dividers, columns, wood furniture, shelves, sofas, and patterned carpet.
The original inventory contains nine computers, six console or handheld stations, three cabinets, and one cassette deck.
The jukebox and cinema add two stations. All 19 original stations remain, for a total of 21.

| Area | Contents |
| --- | --- |
| THE LOUNGE | The nearby host, a sofa, a coffee table, the entrance jukebox, and the large cinema CRT. |
| AMIGA & 8-BIT LAB | Amiga 500, Amiga 1000, Commodore 64, ZX Spectrum, and Atari 520ST. |
| THE BBS CORNER | IBM PC XT, Apple IIe, Macintosh 128K, and Amstrad CPC 464. |
| NINTENDO & SEGA | NES, Famicom, Master System, Mega Drive, and Game Boy. |
| THE ARCADE ROW | Star Patrol, Brick Break, the Tokyo Nights cabinet, and Atari 2600. |
| REPAIR & DEMO STAGE | The cassette deck, repair bench, spare boards, cables, disks, and shelves. |

`src/club-data.mjs` defines all 21 stations, six map destinations, nine crew positions, and collision footprints.
The nine characters reuse the original roster and voxel artwork through `VRArt`.

### Original marks and gallery

- `ClubRoom.omarchyWall` uses the original cached Omarchy block logo on a green-framed wall sign.
- Its `768 × 256` texture occupies an `8.4 × 2.8m` plane at `[0, 3, -13.74]`.
- The sign retains the gold `MIDNIGHT COMPUTER CLUB · 1989` caption.
- The DHH shirt carries the same original logo on a `0.33m`-wide badge after the artwork loads.
- `src/club-logo-wall.js` draws 65 original project marks across five local gallery panels.
- Each panel uses a `2048px`-wide canvas with height derived from its physical aspect ratio.
- Two rows organize the marks. Gold titles, muted subtitles, cyan frames, and light square backplates retain readable source shapes.
- The gallery preserves each mark's aspect ratio and project label. Panel text uses Courier New.
- The gallery distinguishes `foundation`, `base`, and `optional` scopes in `assets/open-source/manifest.json`.
- The vendor script explicitly excludes GNOME, GTK, and Qt.
- A missing mark retains its project label and light backplate. A failed manifest request leaves plain panel canvases.

| Panel | Marks | Physical size |
| --- | --- | --- |
| THE OMARCHY DESKTOP | 10 | `14 × 3.1m` |
| EDITORS & TERMINALS | 13 | `14 × 3.1m` |
| TOOLS & FRAMEWORKS | 15 | `12.5 × 2.7m` |
| LANGUAGES & RUNTIMES | 16 | `11.2 × 2.7m` |
| OPEN-SOURCE APPS | 11 | `11.2 × 2.7m` |

`tools/open-source-catalog.mjs` records project roles, installation scopes, and evidence from Omarchy package lists and manuals.
`tools/vendor-open-source-logos.mjs` verifies that evidence before it imports the marks.
The sources include pinned `simple-icons` version `16.31.0`, upstream artwork, and the original Omarchy and Cliamp block files.
The current manifest records Omarchy source commit `760a546a1c883d9bf3f33e3675920318fbf3fe76`.

It retains source URLs, license labels, asset hashes, and reference-file hashes.
Simple Icons marks use CC0-1.0. Upstream marks retain their own license metadata, including CC-BY-SA-4.0 for Foot.
PNG files retain embedded provenance. SVG files retain source metadata.
The tooling panel also names 12 verified terminal utilities separately from the 65 marks.

To refresh the gallery from the sibling Omarchy checkout, run:

```sh
npm run assets:logos
```

To use another Omarchy checkout, run:

```sh
OMARCHY_SOURCE=/path/to/omarchy npm run assets:logos
```

### Articulated crew and standing scale

`src/club-avatars.js` extrudes the original sprite colors into articulated voxel heads, torsos, arms, and legs.
Visible sprite bounds calibrate each standing body to `1.95m`. Per-character eye rows align the eyes near the player's `1.65m` eye height.
The factory retains the original smile, profile, and back faces. Viewer direction selects the visible face.
`src/club-motion.mjs` assigns one gesture to each roster position.

| Club role | Gesture |
| --- | --- |
| Club host | Wave |
| Console collector | Glasses adjustment |
| Disk archivist | Coffee raise, hold, tilt, and lower |
| Modem operator | Stretch |
| Arcade regular | Hand gesture |
| MIDI musician | Alternating beat taps |
| Hardware repair | Floppy disk inspection |
| Handheld collector | Handheld use |
| BASIC programmer | Explanation gesture |

- `solveArm` uses two-segment inverse kinematics to place the hands. The coffee mug follows the solved left hand.
- The coffee cycle repeats every `14s`. Smoothstep raises the mug from phase `1.2s` to `2.3s`.
- The mug holds near the mouth until `5.2s`, then lowers through `6.4s`. The full sip tilts it by `0.5` radians.
- Walk targets sit `0.45–0.85m` from each home position. Walk speed ranges from `0.27m/s` to `0.32m/s`.
- Candidate paths use `0.08m` checks. The crew collision radius is `0.36m`.
- Live crew footprints update with position. Collisions, interaction checks, and visible models use those same positions.
- Crew paths reserve map destinations, machine approach points, the player's space, and the current spatial conversation-panel area.
- Characters stop their walks within `3.2m` of the player. The selected conversation character also stops its walk and fades its gesture.
- Nearby stationary characters turn toward the player within `5m`. Walk and gesture blends smooth transitions between activities.
- Pause freezes the crew clock, gait, and position. Reduced motion stops autonomous walks, gestures, head tilt, and body bounce.
- Reduced motion retains player-controlled movement, character orientation toward the player, and machine demos.

### Interactive recreations and original demos

The hardware uses local Canvas and JavaScript recreations with menu-selected actions.
These recreations do not load ROMs, emulate processors, boot operating systems, or connect to a live BBS.
BASIC and terminal controls select fixed examples rather than accept arbitrary typed programs or commands.

| Hardware | Implemented actions |
| --- | --- |
| Amiga 500 and Amiga 1000 | Select the Workbench recreation, checker-ball demo, or original starfield. |
| Commodore 64, Apple IIe, and CPC 464 | Select a BASIC prompt, fixed program listing, disk directory, or original starfield. |
| ZX Spectrum | Select the tape-load sequence or color and sprite test. |
| Atari 520ST | Select the GEM recreation or cycle through three MIDI-style step patterns. |
| IBM PC XT | Select the AT response, local dial sequence, bulletin, or crew list. |
| Macintosh 128K | Select the desktop recreation or the `16 × 12` sketchpad. Toggle individual cells or clear the grid. |
| NES, Famicom, Master System, and Mega Drive | Play the original Star Patrol game or select the color and sprite demo. |
| Game Boy | Play the original Snake demo with the green display palette. |
| Atari 2600 | Play the original Brick Break game or select the color and sprite demo. |
| Star Patrol and Brick Break cabinets | Play their original club games or select the sprite demo. |
| Tokyo Nights cabinet | Open the VR race and garage. |
| Cassette deck | Control the supplied MP3 through the shared song player. |
| Omarchy jukebox | Browse the local library, play a track, or edit the queue. |
| Club cinema CRT | Open the official Omacon 2026 player in the browser after XR ends. |

Hardware menus expose a power action, except for the jukebox's dedicated music menu.
A demo or game selection also turns its station on.
Live `256 × 192` textures update the physical screens. The selected mini-game also appears in the native or spatial game panel.

### Local radio jukebox

- The physical jukebox stands at `[3.3, 0, 9]` beside the entrance. Its collision footprint measures `1.72 × 1.12m` and `2.45m` high.
- Dark wood, gold trim, cyan light strips, six physical buttons, and a speaker grille connect it to the existing room materials.
- Its curved display measures `0.95 × 0.7m` at height `1.47m`.
- The display shows the title, artist, playback state, queue count, explicit flag, and a track-progress strip.
- The artist caption follows the wrapped title. This keeps the two captions separate.
- Select the cabinet or screen to open the shared native or spatial library panel.
- The library contains 33 local MP3 files. Library and queue pages show at most six tracks.
- A track detail panel offers `PLAY NOW` and `ADD TO QUEUE`, with transport, library, queue, and room-return actions.
- `PLAY NOW` replaces the current track without clearing the queue. `ADD TO QUEUE` appends one entry.
- A queued-track action removes that entry. `CLEAR QUEUE` removes all queued entries. The queue accepts duplicates and caps at 100 entries.
- `NEXT TRACK` and an active audio `ended` event consume the queue first.
- When the queue is empty, playback advances from the current library index and wraps after the final track.
- `PAUSE MUSIC` preserves the position. `RESUME MUSIC` resumes that track. Initial playback uses `PLAY MUSIC` or `PLAY QUEUE`.
- Pending requests expose `CANCEL LOAD`. A `15s` timeout or media error provides retry through `PLAY NOW` or an alternate track.
- Request IDs and detached media listeners prevent late events from a canceled track from replacing the current track.
- Audio starts only after a playback action. The initial audio element uses `preload="none"` and volume `0.65`.
- The queue and track position remain in memory for this page visit. The jukebox does not store them across reloads.
- The jukebox and original song pause each other. The original song suppresses the Atari ST pattern during play.
- Jukebox playback and pending loads also suppress the Atari ST pattern.

`tools/vendor-club-radio.mjs` imports the sibling `radio.omarchy.org/public/tracks/` directory.
The import verifies that the source MP3 filenames and playlist entries match exactly.
`assets/radio/` contains all 33 MP3 files. `assets/club-radio.js` supplies runtime metadata, and `assets/radio/playlist.json` records the local playlist.
Both metadata files preserve source order, titles, artist credits, and explicit flags.
They also record byte counts and SHA-256 hashes for each track, plus the source playlist URL and hash.
`tests/club-jukebox.test.mjs` compares the metadata and verifies each local audio file's bytes and hash.

To refresh the local library, run:

```sh
npm run assets:club-radio
```

To use another track directory, run:

```sh
CLUB_RADIO_SOURCE=/path/to/public/tracks npm run assets:club-radio
```

### Official browser cinema

- The lounge CRT stands at `[-2.5, 0, 11.2]` with a `90`-degree yaw. Its curved face measures `2.75 × 2.06m` at height `1.74m`.
- The wood cabinet uses a `3.5 × 1.35m` local collision footprint and `3.1m` collision height.
- Its local texture shows color bars, the Omacon 2026 title, the source channel label, and `WATCH IN THE BROWSER`.
- The device panel explains that playback exits VR. `WATCH OMACON 2026` starts the user-approved browser flow.
- `openCinema` cancels speech, pauses both music sources, silences room effects, clears controls, and pauses the room.
- It awaits XR exit before `ClubCinema.show` opens the native modal dialog.
- If XR remains active, the room reports an exit instruction and leaves the iframe absent.
- `ClubCinema.load` creates the official `https://www.youtube.com/embed/Bic2KjFFj6w` iframe only after the watch action or a retry.
- The URL uses `rel=0`, `playsinline=1`, `enablejsapi=1`, and the page origin. YouTube controls start playback.
- The dialog exposes a title, description, status, `BACK TO THE ROOM`, `RETRY PLAYER`, and `OPEN ON YOUTUBE`.
- Retry removes the previous iframe before it creates another. A `15s` timeout or iframe error keeps retry and the official watch-page link available.
- Close or Escape removes the iframe and returns to exploration with canvas focus. A hidden document retains the room's paused state.
- Document visibility loss requests a YouTube pause. Room keyboard commands remain inactive while the dialog is open.
- The video uses the browser dialog. The physical CRT remains a title card, with no VR video texture or local video download.

### Conversations and mini-games

- Each original character has a club role, greeting, and three selectable scripted topic responses.
- Topics cover hardware, demos, room directions, and game controls. The player can change topics freely or return to the room.
- The panel shows the speaker's original full-body sprite, role, dialogue, three topics, `READ ALOUD`, and `BACK TO THE ROOM`.
- `READ ALOUD` uses `speechSynthesis` and the browser's system voice. It does not reproduce a character's voice.
- Speech starts on request. Topic changes, navigation, and focus loss cancel the active utterance.
- The speech error handler ignores `canceled` and `interrupted` events. Neither event reports a voice failure.
- Native panels retain dialogue when speech fails. Live announcements report the selected speaker and response.
- Star Patrol uses movement and fire controls against 18 descending targets. Each hit awards 100 points, and a cleared formation completes the round.
- Brick Break uses a paddle, 24 bricks, and three lives. Each brick awards 50 points, and the paddle hit position changes the rebound.
- Snake uses a `16 × 12` grid. Food awards ten points, reverse input is rejected, and contact with the wall or body ends play.
- The mini-game panel provides start or restart, `PAUSE`, and `LEAVE THE GAME` actions.
- Panel `PAUSE`, native toolbar `PAUSE`, and keyboard `P` retain the active round. `RESUME` continues that round.
- Completed rounds update `tokyo-nights.club.best` for `star`, `brick`, and `snake`. Invalid stored values use zero, and blocked storage permits in-memory play.

### Movement and interaction

- Smooth movement uses horizontal head direction at `4.2m/s`. Diagonal input retains the same maximum speed.
- Standing height is `1.95m`, and the player eye height is `1.65m`. XR view centering uses that eye height.
- The player radius is `0.3m`. Movement uses steps of at most `0.1m` and separate axis checks to slide along obstacles.
- Walls, lab dividers, columns, furniture, stations, and crew footprints block smooth movement.
- Interactions require a target within `3m` and a clear segment from the head to that target.
- The left XR stick moves. The right stick provides one `30`-degree snap turn until it returns to neutral.
- Snap turns rotate around the tracked head position. A short fade lasts `0.1s`.
- Hold the left XR trigger to aim a floor teleport. Release it to use a valid destination.
- The teleport arc checks each segment against obstacles and the ceiling. The destination must also pass `canStand`.
- A valid arc is cyan with a green destination ring. An invalid arc and ring are pink.
- Teleport uses a `0.14s` fade. Map actions use six predefined, collision-checked destinations with destination yaw.
- The right trigger selects a nearby target or spatial action. `A` interacts through the center view with a nearby-target fallback.
- `B` closes a panel or pauses exploration. `Y` opens the map, and `X` centers the view.
- Ordinary state transitions preserve controller edge latches. A held face button does not repeat its menu action after a state change.
- Screen controls use WASD or arrow keys for movement, pointer drag for view direction, and `E` for interaction.
- `Tab` opens the map from exploration. `Escape` closes or resumes a panel, `P` toggles pause, and `R` centers the view.
- `Space` starts a ready mini-game and holds fire in Star Patrol. Touch controls provide the corresponding movement and fire actions.
- Standard gamepads provide left-stick movement, right-stick snap turns, interaction, map, back, center, fire, and left-trigger floor teleport.

### Native layout and access

- `chrome` measures header and footer height into `--club-chrome`. The room region uses the remaining `100dvh` height during exploration.
- The desktop entry card is `400px` wide with `28px` padding and a `28px` right inset. Its content scrolls within the room region.
- At widths up to `760px`, the entry state puts a `30dvh` preview above the full-width card. The preview retains a `230px` minimum height.
- Native interaction panels use `24px` padding, two equal action columns, and `10px` gaps. Mini-game panels use three equal action columns.
- Jukebox library and queue panels use six grid tracks. Each song spans three tracks, which forms two visible song columns.
- Footer controls span two grid tracks, which forms three visible control columns. The first footer control starts a fresh row.
- Track buttons align text left and wrap long titles. Their metadata uses `12px` text with an `8px` top margin.
- Mobile panels use `12px` side insets, `18px` padding, and `8px` action gaps. Arcade panels reserve space above the touch controls.
- Native headings use pink Arcade text. Dialogue uses lavender Courier New, subtitles use yellow, and the first action uses gold.
- Panel headings use `18px` text, dialogue uses `15px`, and choices use `13px`. Mobile sizes become `15px`, `14px`, and `12px` respectively.
- Panel actions have a `46px` minimum height, reduced to `44px` on mobile. Cyan focus outlines identify keyboard focus.
- Room-state changes target the first native action for focus. Topic responses retain action focus, and return to exploration focuses the canvas.
- During XR, native entry, interaction panels, movement controls, location text, reticle, and hints hide in favor of spatial controls.
- The cinema dialog uses width `min(1000px, calc(100% - 32px))`, maximum height `calc(100dvh - 32px)`, and `28px` padding.
- Its dark backdrop uses `#16161eee`. A line-colored border surrounds the panel-colored screen frame with `12px` padding.
- The iframe uses a `16:9` aspect ratio and `200px` minimum height. Dialog content scrolls vertically.
- Cinema headings use `24px` Arcade, and body copy uses `14px` Courier New. Mobile headings use `18px`.
- Cinema actions wrap with `10px` gaps, `46px` minimum height, and `210px` flex basis. Mobile dialog and frame padding become `18px` and `6px`.

### Spatial panels and head pose

- The main spatial panel uses a `1024 × 640` canvas on a `1.7 × 1.0625m` plane.
- Talk panels retain depth tests and depth writes beside the projected character bounds.
- Talk panels retain `1.85m` forward depth toward the selected character and a `0.72m` vertical offset below the head.
- `clearCharacter` projects the visible voxel bounds horizontally at that depth. It places the panel beside those bounds with `0.24m` clearance.
- The side choice minimizes overlaps with other obstacles, then horizontal displacement. The panel rotates toward the head.
- Machine and game panel distance uses `clamp(targetDistance - 0.8, 0.65, 1.85)` meters. Their scale uses `distance / 1.85`.
- Machine panels use a scaled `0.45m` vertical offset, and game panels use a scaled `0.2m` offset.
- Entry, pause, map, sketch, device, and arcade panels use overlay depth behavior. They disable depth tests and depth writes with `renderOrder = 200`.
- The sketch toolbar uses a `512 × 128` canvas on a `0.95 × 0.2375m` plane, `0.96m` below the head.
- Spatial choices use two columns of `460px` buttons. Mini-game panels use three columns of `304 × 62px` buttons with `14px` horizontal gaps.
- The first spatial action uses gold, and controller hover adds a `4px` cyan stroke.
- Jukebox pages place six `460 × 80px` track buttons in two columns, starting at texture row `212px` with `12px` vertical gaps.
- Six `294 × 58px` footer controls occupy three columns from row `488px`. The menu remains within the `1024 × 640` texture.
- Jukebox track labels use `21px` Courier New, and metadata uses `18px`. These values describe texture pixels.
- The current library track and transport action can use gold. Disabled page and queue actions use opacity `0.36`.
- `xrState` obtains the viewer pose from `XRFrame` and the active reference space. `trackPose` stores its local position and orientation.
- `headPose` transforms that pose through the locomotion rig. It does not depend on the renderer's transient array-camera transform.
- The transformed pose supplies movement direction, interaction checks, panel placement, and spatial audio orientation.
- Shared `VRSession` accepts surface-specific status labels and `framebufferScale`. The club passes `0.7`, while the race default remains `0.85`.

### Materials, sound, and recovery

- Instanced boxes form the wood furniture, computer cases, keyboards, consoles, cartridges, and shelves.
- CRT faces use curved meshes. The Game Boy uses a flat display, and the original crew retains voxel geometry.
- Screen and panel textures use nearest-neighbor magnification, linear minification, and no mipmaps.
- Warm light, indigo carpet, beige hardware, and Tokyo Night signs define the room. The floor draws first without depth writes.
- The screen renderer uses antialiasing and caps pixel ratio at `1.4`. Machine texture updates limit distant refreshes.
- `SOUND` controls spatial fan tones, interaction tones, modem tones, and the Atari ST pattern demo.
- HRTF panners locate these effects in the room. The listener follows the transformed head pose.
- The header, cassette deck, and pause panel share MP3 play, pause, resume, cancellation, and retry actions.
- The original MP3 and jukebox start on request and operate independently of `SOUND`.
- The original song suppresses the Atari ST pattern during play. Jukebox playback and pending loads also suppress it.
- Screen focus loss and XR visibility or tracking loss pause activity, silence effects, pause both music sources, and cancel speech.
- Session exit pauses the room and restores screen controls. The player can resume the prior activity or enter XR again.
- Focus and session recovery call `input.reset(true)`. Held face-button menu actions remain suppressed until release.
- Reduced motion stops autonomous crew walks, gestures, head tilt, body bounce, and button transitions.
- User-controlled movement, character orientation toward the player, and machine demos continue.

### Security room

- The separate `18 × 14m` room occupies `x: [-9, 9]`, `z: [14, 28]`, with solid outer walls.
- The former south decorative door becomes a `3.4m`-wide doorway with `3.2m` clearance. Smooth walk and arc teleport cross it continuously.
- `SECURITY ROOM` is the eighth map destination. The current club contains 27 stations and 14 human cameos.
- Five retro CRT benches, two server racks, and a team command board furnish the room.
- Four authored wall images cover red-team work, blue-team work, zero-day research, and digital forensics.
- Five local exercises use three steps each: `pentest`, `zero-day`, `blue-team`, `forensics`, and `reverse`.
- Each choice gives feedback. Correct choices advance the exercise and update its latest evidence on the physical CRT.
- Each exercise retains its step, feedback, latest evidence, and completion state in memory across panel closure and pause.
- A page reload clears all exercises. `RESTART EXERCISE` resets the selected exercise.
- The blue-team containment step quarantines BYTE at `x: 0`, `z: 21`.
- BYTE patrols the central rectangle at `x: [-2, 2]`, `z: [18, 22]`. Its clock freezes during BYTE interaction, pause, and reduced motion.
- Quarantine stops BYTE in the containment field. Release resets its patrol. BYTE faces the viewer during interaction and containment.
- Native and spatial panels share `ClubGame` state. Exercises use the `device` state and `layout: 'security'`.
- Security spatial controls start at texture `y = 430` in the existing `1024 × 640` panel. The spatial map uses three columns.
- The addition reuses the global typography and rectangular controls from `DESIGN.md`.

#### Security source provenance

The five cameos match the names and country labels on the official [security team page](https://omarchy.org/teams/).
`SECURITY_CREW` in `src/club-security.mjs` stores the roster URL and each official photo URL.

| Cameo | Official country label | Official photo reference |
| --- | --- | --- |
| Adrian Rangel | Mexico | [adrian-rangel.webp](https://omarchy.org/assets/images/team/adrian-rangel.webp) |
| Mehmet İnce | UK/Türkiye | [mehmet-ince.webp](https://omarchy.org/assets/images/team/mehmet-ince.webp) |
| Erik Melton | Norway | [erik-melton.webp](https://omarchy.org/assets/images/team/erik-melton.webp) |
| Sayem Chowdhury | Bangladesh | [sayem-chowdhury.webp](https://omarchy.org/assets/images/team/sayem-chowdhury.webp) |
| Sebastian Stange | Germany | [sebastian-stange.webp](https://omarchy.org/assets/images/team/sebastian-stange.webp) |

`src/club-security-art.js` draws original `48 × 104` Canvas portraits from those photo references.
The avatar factory turns them into articulated voxel figures. Club dialogue uses fictional scripts.
The wall images and command board use authored Canvas art. BYTE uses authored voxel geometry in `src/club-security-room.js`.
`src/club-security-screen.js` draws the local exercise displays. The extension adds no shipped raster files or runtime photo requests.

### Design studio

- The separate `18 × 14m` studio occupies `x: [9, 27]`, `z: [14, 28]`, with solid exterior walls.
- Its independent doorway centers at `x: 12.5`, `z: 14`, with `3.4m` width and `3.2m` clearance. Smooth walk and arc teleport cross it.
- `DESIGN STUDIO` is the ninth map destination. The studio brings the current club totals to 32 stations and 19 human cameos.
- Paper-colored desks, beige CRTs, cork-colored flooring, sample sheets, three framed studies, a team board, and the central live easel distinguish the room.
- The `EDITORS & TERMINALS` gallery moves from the original south wall to the studio south wall at `[18, 2.65, 27.74]`.
- That panel retains its `14 × 3.1m` size and 13 marks. All 65 original gallery marks still load.
- `drawMap` in `src/club-screens.js` derives union bounds from `FLOORS`: `x: [-18, 27]`, `z: [-14, 28]`.
- The spatial map fits ten actions in three columns within its `1024 × 640` texture: nine destinations and `CLOSE MAP`.
- The panels reuse existing Tokyo Night UI tokens, Arcade headings, Courier New text, rectangular controls, gold selection, and cyan focus.

Five creative desks share `ClubGame.design`, an in-memory poster state. Every desk CRT, native panel, spatial panel, and physical easel uses `drawDesignPoster`.

| Desk field | Choices |
| --- | --- |
| `palette` | `NIGHT PRINT`, `PAPER PRINT`, `BLUE PRINT` |
| `type` | `PIXEL DISPLAY`, `TERMINAL TYPE`, `MIXED TYPE` |
| `layout` | `POSTER`, `SPLIT`, `GRID` |
| `icon` | `CURSOR`, `PENCIL`, `WINDOW` |
| `motion` | `STATIC`, `STEP`, `PULSE` |

- Choices persist across desk changes, panel closure, and pause. A page reload restores defaults.
- All three layouts retain `MIDNIGHT DESIGN CLUB` after the finish-review fix. Motion affects the icon while the words stay still.
- Pause freezes the poster clock. Reduced motion keeps the icon static and retains the selected design.
- Native `#club-design-canvas` uses `768 × 432` pixels above the shared two-column action grid.
- The custom spatial design panel places a `470 × 264px` preview left and four `434 × 72px` actions right.
- Those actions provide three desk choices and `BACK TO THE ROOM`. The easel uses a `1024 × 576` texture on a `3.8 × 2.1375m` plane.

#### Design source provenance

`DESIGN_CREW` in `src/club-design.mjs` records the official [design team roster](https://omarchy.org/teams/), country labels, and photo-reference URLs.

| Cameo | Official country label | Official photo reference |
| --- | --- | --- |
| Barış Girişmen | Türkiye | [baris-girismen.webp](https://omarchy.org/assets/images/team/baris-girismen.webp) |
| Christoffer Hallas | USA | [christoffer-hallas.webp](https://omarchy.org/assets/images/team/christoffer-hallas.webp) |
| Daniel Schmier | Germany | [daniel-schmier.webp](https://omarchy.org/assets/images/team/daniel-schmier.webp) |
| Andrés Villagrán | Chile | [andres-villagran.webp](https://omarchy.org/assets/images/team/andres-villagran.webp) |
| Niklas Jul | Denmark | [niklas-jul.webp](https://omarchy.org/assets/images/team/niklas-jul.webp) |

`src/club-team-art.js` extends the original `48 × 104` Canvas sprites for both teams. The avatar factory turns them into articulated voxel figures.
`src/club-security-art.js` preserves security callers through reexports of `makeTeamCharacter` as `makeSecurityCharacter`, plus `securityPoster` and `commandBoard`.
The shared art preserves Sebastian's glasses, spiked hair, green hoodie, and clean-shaven face, plus Erik's fox-fur hat and beard.

The user-approved portraits, wall studies, team board, and live poster use original Canvas art and voxel geometry with source URLs.
The extension adds no shipping rasters or runtime photo requests. Cameo conversations use fictional scripts.

### Mac room

- The separate `24 × 18m` room occupies `x: [27, 51]`, `z: [14, 32]`, with solid exterior walls.
- Its own doorway crosses the studio east wall at `x: 27`, `z: 25.5`, with `3.2m` width and `3.2m` clearance.
- Smooth walk and arc teleport cross that doorway. `MAC ROOM · TEAM M` is the tenth map destination.
- The Mac extension brings the current club totals to 39 stations and 34 human cameos.
- A cool gridded floor, aluminum-colored workstations, beige classic cases, and colorful iMac hardware frame open aisles.
- `ClubMacRoom` in `src/club-mac-room.js` places the original cached Omarchy block logo on an `11.5 × 3.45m` east-wall plane.
- The logo plane sits at `[50.76, 2.65, 23]`. `drawMacDisplay` in `src/club-mac-screen.js` reuses that original logo on every Mac desktop texture.
- Three team boards each show five cameos with their official names and country labels.
- Native and spatial panels reuse the existing Tokyo Night UI, Arcade headings, Courier New text, rectangular controls, gold selection, and cyan focus.

`MAC_MODELS` in `src/club-mac.mjs` defines seven distinct local hardware models:

| Model | Year | Processor |
| --- | --- | --- |
| Macintosh 128K | 1984 | Motorola 68000 |
| iMac G3 | 1998 | PowerPC G3 |
| iMac G4 | 2002 | PowerPC G4 |
| Power Mac G5 | 2003 | PowerPC G5 |
| MacBook Air M1 | 2020 | Apple M1 |
| Mac mini M1 | 2020 | Apple M1 |
| Mac Studio | 2022 | Apple M1 Max |

Every model exposes `OMARCHY DESKTOP`, `LOCAL TERMINAL`, `HARDWARE CARD`, `POWER OFF` or `POWER ON`, and `BACK TO THE ROOM`.
A demo selection powers the station, updates its live `256 × 192` screen texture, and returns to exploration.
The terminal displays fixed local examples. These are club display demos, with no native OS boot or hardware emulation.

Keyboard, pointer, touch, gamepad, and XR controller inputs use the existing club controls.
Mac cameos reuse the existing crew motion. Pause freezes their clock, and reduced motion stops autonomous walks and gestures.

#### Mac source provenance

The verified `MAC_CREW` in `src/club-mac.mjs` matches all 15 names and country labels on the official [M team roster](https://omarchy.org/teams/).
Each entry stores the roster URL as `source` and its official photo URL as `imageSource`.
Those photo URLs follow `https://omarchy.org/assets/images/team/<id>.webp` and match the official page.

Ryan Murray's [bridge](https://omarchy.org/assets/images/team/ryan-murray.webp) and Eryk Wieliczko's [hill](https://omarchy.org/assets/images/team/eryk-wieliczko.webp) are public landscape images.
Their cameos use original illustrated avatar heads.
The artwork retains [Liam's pixel face](https://omarchy.org/assets/images/team/liam.webp) and [Shun Li's Mii-style reference](https://omarchy.org/assets/images/team/shun-li.webp).

`src/club-team-art.js` adds `cropped`, `bald`, `cap`, `style: 'varsity'`, and illustrated `profileBadge` heads to the shared artwork.
Original `48 × 104` Canvas sprites supply the shared voxel avatar factory. Cameo dialogue uses fictional club scripts.
Source graphics use procedural Canvas, voxels, and local geometry. The extension adds no shipping rasters or runtime photo requests.

## Verification evidence

- The supplied current results report all 24 focused Node tests in `tests/club.test.mjs` and `tests/club-jukebox.test.mjs` as passed.
- Coverage includes reachability, collisions, teleportation, dialogue, scores, controller recovery, mini-games, crew movement, coffee phases, local hashes, and queue behavior.
- All ten clubhouse browser tests in `tests/browser/club.spec.js` pass in the supplied results.
- The three media browser cases pass again after the final queue-grid and caption fixes.
- The complete clubhouse-only candidate passes all 74 Node tests and all 47 browser tests, including the existing game regressions.
- The speech check intercepts `speechSynthesis.speak` to verify the request. It does not verify audible system-voice output.
- The hardware browser check pauses the active round through `#club-pause`, verifies its elapsed time stays fixed, and resumes it.
- The sketch check projects a point on the Macintosh CRT into pointer coordinates, clicks that screen, and verifies cell paint and clear.
- The character-scale check measures visible voxel bounds within `0.04m` of `1.95m` and eyes within `0.045m` of `1.65m`.
- The coffee check observes a real sip, then holds that observed phase for a stable capture.
- It checks a mug rise above `0.35m` and a rim-to-mouth distance below `0.1m`.
- The gallery browser check loads all 65 marks, checks the exclusions, and confirms the original DHH shirt mark.
- MP3 browser cases play real local tracks. The queue case seeks to `duration - 0.08s` to exercise automatic queue advance.
- The same browser case checks exclusive playback with the original song and pause on focus loss.
- Cinema cases use an explicit test iframe at the official embed URL. They verify deferred creation, retry, XR exit, close, and focus return.
- The cinema fixture captures do not prove live YouTube playback.
- The stereo IWER check holds `Y` for `250ms` and verifies a single map activation. It releases `Y` before destination selection.
- The check selects the Amiga map destination and walks toward the machine with the left stick.
- It selects the physical Amiga screen with the right controller and starts the checker-ball demo through the spatial menu.
- IWER supplies stereo emulation. Physical headset comfort, performance, audio, and controller behavior remain unverified.
- **Finish verdict:** The fresh reviewer returns `ship` for the supplied primary desktop, mobile, and stereo clubhouse scope, with no material fixes.
- The reviewer inspects 14 captures under `.impeccable/review/`, listed below.
- The supplied mechanical detector runs once. Its `new` font warning comes from quoted Courier New shorthand and is a false positive.
- The detector also reports an inherited stripe advisory and the pre-existing `17px` landscape type advisory.
- The supplied `assets/open-source/` provenance scan reports four rasters and zero missing provenance records.
- This documentation pass checks source and test definitions and records the supplied review results. It runs no visual review or browser tests.

| Review area | Captures under `.impeccable/review/` |
| --- | --- |
| Entry | `club-desktop.png`, `club-mobile.png` |
| Conversation | `club-talk-desktop.png` |
| Coffee | `club-coffee-rest.png`, `club-coffee-sip.png` |
| Gallery | `club-logo-gallery.png` |
| Jukebox | `club-jukebox.png`, `club-jukebox-library.png`, `club-jukebox-queue.png`, `club-jukebox-mobile.png` |
| Stereo media menus | `club-headset-jukebox.png`, `club-headset-cinema.png` |
| Browser cinema fixtures | `club-cinema-desktop-fixture.png`, `club-cinema-mobile-fixture.png` |

### Documentation limits

Live YouTube playback, physical headset results, and audible speech results remain unverified.
The supplied clubhouse finish verdict arrives through the handoff. The review directory contains its captures but no separate clubhouse verdict file.
The inherited stripe and landscape-type advisories remain outside this documentation pass. They do not become new design rules.

### Security room checks

- `.impeccable/review/club-security-finish.md` records `ship` for the supplied desktop, mobile, and IWER stereo scope. It requests no material fixes.
- The supplied full Node run passes all 99 tests. The browser runs pass 13 original clubhouse tests and all three new security tests.
- After the final orientation adjustments, the supplied reruns pass 22 focused Node tests and all three security browser tests.
- The tests cover doorway traversal, solid walls, teleport arcs, five cameos, all exercises, retained evidence, BYTE controls, mobile access, and spatial actions.
- The supplied detector runs once. It reports the inherited Courier New `new` false positive and stripe advisory.
- Its `#283643` advisory describes the local 3D floor material. Material colors do not become global tokens.
- The supplied build check and this documentation pass both pass `git diff --check`.
- This pass checks source, test definitions, the official roster, the finish record, and the desktop, mobile-lab, and stereo-lab captures.
- Physical headset behavior remains unverified.

The first browser attempt reaches an occupied port and returns `404`. Correct verification uses `PORT=3127 CI=1`.
To reproduce the supplied checks, run these commands from the repository root:

```sh
npm test
node --test tests/club.test.mjs
PORT=3127 CI=1 npm run test:browser -- tests/browser/club.spec.js --grep-invert security
PORT=3127 CI=1 npm run test:browser -- tests/browser/club.spec.js --grep security
git diff --check
```

| Review area | Captures under `.impeccable/review/` |
| --- | --- |
| Security room and desktop panels | `club-security-desktop.png`, `club-security-cameo.png`, `club-security-lab.png`, `club-security-virus.png` |
| Security mobile panels | `club-security-mobile.png`, `club-security-lab-mobile.png` |
| Security IWER stereo | `club-security-headset.png`, `club-security-lab-headset.png` |
| Entry and map | `club-desktop.png`, `club-mobile.png`, `club-map.png` |

### Design studio checks

- The supplied full Node result passes all 101 tests. The supplied clubhouse browser result passes all 19 tests.
- The three design browser tests pass again after the GRID copy fix.
- Source and tests cover doorway travel, solid walls, teleport arcs, five distinct cameos, retained desk choices, easel updates, pause, and reduced motion.
- Browser checks also cover all 65 gallery marks, mobile touch actions, spatial map bounds, and spatial poster controls.
- `.impeccable/review/club-design-finish.md` requests one fix: preserve the poster message across layouts.
- `.impeccable/review/club-design-verdict.md` scores that fix as resolved. Its `ship` disposition covers the layout-content fix only.
- The verdict checks all seven recaptures at their original paths and reports no regressions from that fix.
- The supplied detector runs once. It reports the inherited Courier New `new` false positive, stripe advisory, and existing `17px` landscape-type advisory.
- Physical headset behavior remains unverified. Stereo evidence uses IWER emulation.
- This documentation pass checks source, test definitions, capture paths, and both review records. It records the supplied test results.
- The supplied build check and this documentation pass both pass `git diff --check`.

Historical inventory figures describe earlier extensions. The studio totals above describe the current source.
The inherited advisories do not become new design rules.

To reproduce the supplied checks, run these commands from the repository root:

```sh
npm test
PORT=3127 CI=1 npx playwright test tests/browser/club.spec.js
PORT=3127 CI=1 npx playwright test tests/browser/club.spec.js --grep 'design studio'
git diff --check
```

| Review area | Captures under `.impeccable/review/` |
| --- | --- |
| Studio and desktop panels | `club-design-desktop.png`, `club-design-cameo.png`, `club-design-poster.png` |
| Mobile panels | `club-design-mobile.png`, `club-design-poster-mobile.png` |
| IWER stereo | `club-design-headset.png`, `club-design-poster-headset.png` |

### Mac room checks

- `.impeccable/review/club-mac-finish.md` records `ship` for the supplied desktop, mobile, and IWER stereo scope. It requests no material fixes.
- The supplied `npm test` result passes all 103 Node tests. The four new Mac browser cases pass.
- Of the 19 existing browser cases, 18 pass initially. The existing security case times out at `90s` near its final map action.
- That case's overall test budget increases to `120s` with the same assertions, and its rerun passes.
- These runs establish 23 passed browser cases in aggregate. They do not constitute one complete 23-case run.
- `tests/club.test.mjs` and `tests/browser/club.spec.js` cover doorway travel, walls, teleport arcs, all 15 cameos, seven models, and shared controls.
- Browser evidence also covers the original logo, distinct portraits, live screen changes, mobile touch actions, spatial map bounds, and IWER device actions.
- The supplied detector runs once. It reports the inherited Courier New `new` false positive and stripe advisory.
- Its `#408d96` advisory describes the iMac G3 case material. This local material does not become a global token.
- This documentation pass checks source, test definitions, the official roster, the finish record, all nine capture paths, and four representative captures.
- This pass records the supplied test results. The supplied build check and this documentation pass both pass `git diff --check`.
- Physical headset behavior remains unverified.

To reproduce the checks, run these commands from the repository root:

```sh
npm test
PORT=3127 CI=1 npx playwright test tests/browser/club.spec.js
git diff --check
```

| Review area | Captures under `.impeccable/review/` |
| --- | --- |
| Desktop room and cameos | `club-mac-desktop.png`, `club-mac-cameo.png`, `club-mac-crew.png` |
| Desktop hardware | `club-mac-imac.png`, `club-mac-air.png` |
| Mobile panels | `club-mac-mobile.png`, `club-mac-device-mobile.png` |
| IWER stereo | `club-mac-headset.png`, `club-mac-device-headset.png` |
