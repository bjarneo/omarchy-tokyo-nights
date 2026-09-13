---
version: 1
slug: "club-html"
primary_target: "club.html"
related_targets: ["club.css", "src/club-main.js", "src/club-scene.js", "src/club-room.js", "src/club-screens.js", "src/club-engine.mjs", "src/club-data.mjs", "src/club-controls.mjs", "src/club-games.mjs", "src/club-audio.js", "src/vr-session.mjs", "src/vr-art.js", "src/song-player.js"]
---

# Retro clubhouse

## Scope

This surface uses Experience mode. The user requests a large 1980s computer and console room with the existing cameo characters.
The user selects smooth walk plus teleport and free exploration without a main objective.
The implementation provides 30-degree snap turns and both WebXR and screen controls.
The user requests the original Omarchy logo on the club wall and a prominent club link on the game page.
The user also requests individual character gestures, a coffee-drink animation, short walks, and the player's standing scale.

## Direction contract

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

- The arcade toolbar links directly to `club.html`. VR setup provides `EXPLORE RETRO ROOM`, and headset menus provide `RETRO ROOM`.
- The arcade toolbar becomes compact at container widths up to `900px`. At widths up to `380px`, it hides route text.
- `ENTER VR` requests stereo `immersive-vr`. `EXPLORE ON SCREEN` starts the same room with keyboard, pointer, touch, or standard gamepad controls.
- WebGL2 renders the room. WebXR requires HTTPS or localhost on the host device.
- Unsupported XR retains screen exploration when WebGL2 works. Permission denial permits another entry attempt.
- Graphics failure disables entry and provides a WebGL2 or reload message.
- The club header, pause menu, and Tokyo Nights cabinet provide routes to `vr.html`, which contains the race and garage.
- `openRace` pauses the song and exits an active XR session before navigation.
- The room starts in `entry`. Other states are `explore`, `talk`, `device`, `arcade`, `sketch`, `map`, and `paused`.

### Room and station inventory

The room measures `36 × 28m` with a `4.6m` ceiling.
Six areas share open central aisles, lab dividers, columns, wood furniture, shelves, sofas, and patterned carpet.
The inventory contains nine computer stations, six console or handheld stations, three cabinets, and one cassette deck.

| Area | Contents |
| --- | --- |
| THE LOUNGE | The nearby host, a sofa, a coffee table, and the entrance. |
| AMIGA & 8-BIT LAB | Amiga 500, Amiga 1000, Commodore 64, ZX Spectrum, and Atari 520ST. |
| THE BBS CORNER | IBM PC XT, Apple IIe, Macintosh 128K, and Amstrad CPC 464. |
| NINTENDO & SEGA | NES, Famicom, Master System, Mega Drive, and Game Boy. |
| THE ARCADE ROW | Star Patrol, Brick Break, the Tokyo Nights cabinet, and Atari 2600. |
| REPAIR & DEMO STAGE | The cassette deck, repair bench, spare boards, cables, disks, and shelves. |

`src/club-data.mjs` defines all 19 stations, six map destinations, nine crew positions, and collision footprints.
The nine characters reuse the original roster and voxel artwork through `VRArt`.

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

Each station exposes a power action. A demo or game selection also turns its station on.
Live `256 × 192` textures update the physical screens. The selected mini-game also appears in the native or spatial game panel.

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

- Smooth movement uses horizontal head direction at `2.1m/s`. Diagonal input retains the same maximum speed.
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
- Mobile panels use `12px` side insets, `18px` padding, and `8px` action gaps. Arcade panels reserve space above the touch controls.
- Native headings use pink Arcade text. Dialogue uses lavender Courier New, subtitles use yellow, and the first action uses gold.
- Panel headings use `18px` text, dialogue uses `15px`, and choices use `13px`. Mobile sizes become `15px`, `14px`, and `12px` respectively.
- Panel actions have a `46px` minimum height, reduced to `44px` on mobile. Cyan focus outlines identify keyboard focus.
- A new native panel focuses its first action. A topic response retains action focus, and return to exploration focuses the canvas.
- During XR, native entry, interaction panels, movement controls, location text, reticle, and hints hide in favor of spatial controls.

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
- The MP3 starts on request and operates independently of `SOUND`. Its active state suppresses the Atari ST pattern audio.
- Screen focus loss and XR visibility or tracking loss pause activity, silence effects, pause the song, and cancel speech.
- Session exit pauses the room and restores screen controls. The player can resume the prior activity or enter XR again.
- Focus and session recovery call `input.reset(true)`. Held face-button menu actions remain suppressed until release.
- Reduced motion removes idle head tilt and button transitions. User-controlled movement, character orientation toward the player, and machine demos continue.

## Verification evidence

- The supplied results report 73 passes in the latest complete Node suite.
- All 13 room-logic tests in `tests/club.test.mjs` pass. They cover reachability, collisions, teleportation, dialogue, pause, scores, controller edges, recovery, and mini-games.
- All five focused clubhouse browser tests in `tests/browser/club.spec.js` pass.
- The earlier full browser run records 50 passes and one room-controller map failure. The corrected map case passes the focused rerun.
- These results do not establish one full 51-test invocation with zero failures.
- The speech check intercepts `speechSynthesis.speak` to verify the request. It does not verify audible system-voice output.
- The hardware browser check pauses the active round through `#club-pause`, verifies its elapsed time stays fixed, and resumes it.
- The sketch check projects a point on the Macintosh CRT into pointer coordinates, clicks that screen, and verifies cell paint and clear.
- The stereo IWER check holds `Y` for `250ms` and verifies a single map activation. It releases `Y` before destination selection.
- The check selects the Amiga map destination and walks toward the machine with the left stick.
- It selects the physical Amiga screen with the right controller and starts the checker-ball demo through the spatial menu.
- `.impeccable/review/club-headset-machine.png` is the machine-panel capture target.
- Existing `club-desktop.png` and `club-mobile.png` captures in `.impeccable/review/` show the room materials and native entry layouts.
- Other capture targets include dialogue, map, Amiga, BBS, NES play, stereo room entry, floor teleport, and spatial dialogue.
- **Finish verdict:** The reviewer returns `ship` and marks the single dialogue-occlusion fix resolved.
- All dialogue text and five controls remain clear in both eyes. The reviewer confirms no visible desktop or mobile regression within that fix scope.
- The reviewer validates all 12 supplied captures. This verdict covers the dialogue fix in browser and stereo IWER views.
- This documentation pass inspects source, test definitions, and existing desktop and mobile captures. It does not run browser tests.
- Physical headset comfort, performance, audio, and controller behavior remain unverified.
