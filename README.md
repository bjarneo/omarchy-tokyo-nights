# Tokyo Nights

A pixel-art driving adventure with nine drivers, nine cars, and the Tokyo Night palette.
Complete a four-chapter delivery to the Omarchy arcade on Tokyo Bay.

## Play

Start the local server:

```sh
npm start
```

Open `http://localhost:3000` in your browser.
The game needs no build step.
The VR route uses local Three.js modules included in `assets/`.
The local font, sprites, and included audio work without external requests. The car radio streams its songs from Omarchy Radio.

To use a different port:

```sh
PORT=8080 npm start
```

You can also use a static server:

```sh
python3 -m http.server 3000
```

## Controls

| Action | Keyboard |
| --- | --- |
| Steer | Left and Right arrows, or A and D |
| Accelerate | Up arrow or W |
| Brake | Down arrow or S |
| Nitro | Hold Space or Shift |
| Pause or resume | P or Escape |
| Toggle sound | M |
| Toggle fullscreen | F |
| Start or retry | Enter on the selected button |

Touch devices show controls below the game.
The car accelerates automatically to its cruise speed.
The cruise speed is 285 km/h.
The accelerator raises the maximum speed to 340 km/h.
Nitro raises the maximum speed to 460 km/h.
A full nitro tank lasts eight seconds.
Blue nitro canisters appear at randomized locations and restore 45 charge when collected.
Road motion, roadside lights, speed streaks, and the nitro camera response emphasize acceleration.
Choose a driver before each new run.
Use the arrow keys or tap a portrait to select a driver.
Use the Car & Color tab to select a model and paint.
The browser remembers your last confirmed driver, car, and color.
Press Enter or select the drive button to open the chapter briefing.
Select `BEGIN CHAPTER` to start the timer.

The first boost introduces your selected driver.
Later boosts have a 35% chance of a cameo after a 20-second cooldown.
The driver leans out, turns toward you, smiles, and returns inside the car.
DHH has wavy brown hair, blue-gray eyes, and a short beard based on the supplied reference photo.
Ryan has glasses, swept-back hair, and a goatee based on the supplied reference photo.

## Car radio

The stereo below the road plays the 33 songs from [Omarchy Radio](https://radio.omarchy.org/).
Select its play button to start the current track.
Use the previous and next buttons to change tracks.
Select `TUNE` to choose a track or change the volume.
The display retains each song's title, artist credit, and explicit-content flag.

The radio starts only after a playback action.
Pause retains the current position. The next song starts automatically, and the playlist wraps after its last track.
The browser saves your selected track and volume.
The radio and local MP3 stop each other when you select a different music source.
The Sound control governs race effects and synthesized music independently.

The VR cockpit includes a stereo beside the main instruments.
Point at its controls and press a trigger to play, pause, change tracks, or adjust the volume.
Focus or headset visibility loss pauses playback.
If a track cannot load, use Play to retry or Next to choose another track.

`assets/radio-tracks.js` contains the verified catalog. The MP3 URLs point to the station's public files.
To refresh the catalog and verify every audio URL:

```sh
npm run assets:radio
```

## Play the song

Select `PLAY SONG` in the arcade toolbar or VR toolbar.
The button plays `assets/omarchy-tokyo-nights.mp3` and changes to `PAUSE SONG`.
Select it again to pause the song.
The next play resumes from the same position.
After the song ends, the next play starts from the beginning.

The song starts only after you select its control.
The song control works independently of the sound-effects control.
The synthesized arcade tune stops while the MP3 plays.
Engine sounds and race effects remain available through `SOUND ON`.

While the song loads, select the song control to cancel the load.
A failed request shows a message with a retry action.
The song pauses when the game loses focus or the headset opens its system menu.
The VR cockpit menu also contains `PLAY SONG`, `PAUSE SONG`, and load-cancel controls.

## Retro computer club

Open `http://localhost:3000/club.html` to visit the Midnight Computer Club.
The game page provides `THE CLUB` in the masthead, `RETRO ROOM` in the toolbar, and an `ENTER CLUB` banner.
The VR route provides an `EXPLORE RETRO ROOM` native link and a `RETRO ROOM` headset-menu portal.

The club is a 36 × 28 meter interior with six areas, 21 interactive stations, and all nine original voxel characters.
Explore freely, talk to the crew, and try the machines.
The room includes wood furniture, patterned carpet, curved CRTs, disk shelves, old controllers, posters, and a repair bench.
The original Omarchy block logo appears on the main wall and the DHH shirt.

The hardware collection includes:

- Amiga 500, Amiga 1000, Commodore 64, ZX Spectrum, and Atari 520ST.
- IBM PC XT, Apple IIe, Macintosh 128K, and Amstrad CPC 464.
- Nintendo NES, Famicom, Game Boy, Sega Master System, Mega Drive, and Atari 2600.
- Three arcade cabinets and a cassette deck.
- An Omarchy Radio jukebox beside the entrance and a large lounge cinema CRT.

The original 19 stations remain. The jukebox and cinema bring the total to 21.

The machines use interactive recreations of period screens and original club demos.
Try the Amiga checker ball, a BASIC program display, the local bulletin board, the Atari MIDI pattern, or the Macintosh sketchpad.
Hardware menus also include power controls.
The jukebox has a dedicated music menu.
The hardware recreations do not load ROMs, emulate processors, or connect to a live BBS.

### Crew and original logo gallery

Each character has a distinct gesture, including a wave, glasses adjustment, stretch, beat, disk inspection, or handheld use.
The coffee animation uses arm inverse kinematics to raise, hold, tilt, and lower the mug.
Short walks respect obstacles, other characters, map destinations, machine approach points, and conversation-panel space.
Characters stop their walks within 3.2 meters of the player or during their own conversation.
The standing height is 1.95 meters, and the player eye height is 1.65 meters.
Reduced motion stops autonomous walks and gestures. Player-controlled movement and machine demos continue.

Five wall panels display 65 original open-source project marks from local files in `assets/open-source/`.
The gallery distinguishes desktop foundations, base packages, and optional software. It explicitly excludes GNOME, GTK, and Qt.
`tools/open-source-catalog.mjs` defines the projects and their Omarchy evidence.
`tools/vendor-open-source-logos.mjs` imports the marks from pinned `simple-icons` version `16.31.0`, upstream artwork, and the original block logos.
`assets/open-source/manifest.json` records source URLs, licenses, installation scopes, file hashes, and Omarchy reference hashes.
The current Omarchy source commit is `760a546a1c883d9bf3f33e3675920318fbf3fe76`.
The four PNG marks carry embedded provenance.

To refresh the gallery from the sibling Omarchy checkout, run:

```sh
npm run assets:logos
```

### Explore the room

Select `ENTER VR` to use a WebXR headset.
The club uses the same HTTPS or device-local localhost setup as the VR cockpit.
Select `EXPLORE ON SCREEN` for keyboard, pointer, or touch controls.

| Action | Headset controller | Screen control |
| --- | --- | --- |
| Walk | Left stick | WASD or arrow keys |
| Look around | Head movement | Drag the canvas |
| Turn in 30-degree steps | Right stick | Drag the canvas |
| Teleport | Hold the left trigger, aim at the floor, then release | Select a destination from the map |
| Talk or use a machine | Point and press the right trigger, or use A | Look at the target and press E |
| Open the map | Y | Tab or `MAP` |
| Close the current panel | B | Escape |
| Pause an active game | `PAUSE` in the game panel | P or `PAUSE` |
| Center the view | X | R |

A green floor marker shows a valid teleport destination.
Pink marks a blocked destination.
Virtual movement respects walls, furniture, and character positions.
Head-relative movement runs at 4.2 meters per second with the same maximum speed on diagonals.
The map provides six destinations within the room.
Touch devices show movement, use, and map controls.

Approach a character within three meters to start a conversation.
Each character has a greeting and three topic choices.
The dialogue panel appears beside the character.
`READ ALOUD` uses the browser's system voice for the scripted response.

### Play the club games

The club includes three original mini-games:

- **Star Patrol:** Move the ship and fire at the descending formation.
- **Brick Break:** Keep the ball above the paddle and clear the bricks with three lives.
- **Snake:** Collect food and avoid the walls and your own tail.

Use the left stick or arrow keys to control a game.
Use a trigger or Space to fire in Star Patrol.
Completed rounds store a personal best in the browser.
The controls include start, restart, pause, and leave actions.

The Macintosh sketchpad accepts individual cell clicks on its screen.
Select a painted cell to erase it, or use `CLEAR SKETCH`.

`PLAY SONG` and the cassette deck control the supplied MP3.
`SOUND ON` enables room fan noise, interaction tones, modem tones, and the Atari pattern demo.
The Tokyo Nights cabinet opens the existing VR race and garage.

### Play the jukebox

Select the physical jukebox beside the entrance to open its library.
The library contains 33 local MP3 files from [Omarchy Radio](https://radio.omarchy.org/).
Library and queue pages show up to six tracks with titles, artist credits, and explicit-content flags.

1. Select a track from the library.
2. Select `PLAY NOW` to start that track.

`ADD TO QUEUE` appends the selected track. Select a queued track to remove it.
`CLEAR QUEUE` removes all queued tracks. The queue accepts up to 100 entries.
`NEXT TRACK` and automatic track completion consume the queue first.
When the queue is empty, playback advances through the library in source order and loops after its final track.

`PAUSE MUSIC` retains the position. `RESUME MUSIC` continues from that position.
`CANCEL LOAD` cancels a pending request. A failed request offers retry through `PLAY NOW` or a different track through `NEXT TRACK`.
The jukebox and original `PLAY SONG` control pause each other.
Music starts after a playback action. Focus or XR visibility or tracking loss pauses both music sources.

`assets/radio/` contains the 33 MP3 files and `playlist.json`.
`assets/club-radio.js` supplies the runtime metadata.
The import uses the sibling `radio.omarchy.org/public/tracks/` directory.
It preserves source order, titles, artist credits, explicit flags, and SHA-256 hashes for the playlist and every MP3.
The focused tests verify the local MP3 hashes against the metadata.

To refresh the local library, run:

```sh
npm run assets:club-radio
```

To use another source directory, run:

```sh
CLUB_RADIO_SOURCE=/path/to/public/tracks npm run assets:club-radio
```

### Watch the club cinema

The large lounge CRT shows the Omacon 2026 title card and opens its station menu.
Select `WATCH OMACON 2026` to open the official YouTube player for `Bic2KjFFj6w`.
This user-approved browser flow ends an active XR session before the native dialog opens.
The action pauses the room, stops other music and room effects, and cancels speech.
The dialog creates the official iframe only after that action. Use the YouTube controls to start playback.

`RETRY PLAYER` replaces the iframe. `OPEN ON YOUTUBE` opens the official watch page.
`BACK TO THE ROOM` or Escape closes the dialog, removes the iframe, and returns to exploration.
The CRT uses a local title-card texture. The video plays in the browser dialog, not as a VR texture or local download.

### Club source and verification

- `src/club-data.mjs` defines room measurements, stations, dialogue, and collision footprints.
- `src/club-engine.mjs` defines interaction states, collision rules, and scores.
- `src/club-main.js` connects native controls, WebXR, audio, and recovery.
- `src/club-controls.mjs` maps controller and gamepad input.
- `src/club-room.js` builds hardware, furniture, and the original wall sign.
- `src/club-avatars.js` and `src/club-motion.mjs` define calibrated articulated characters, gestures, and short walks.
- `src/club-logo-wall.js` draws the local project-mark gallery.
- `src/club-scene.js` renders the room, teleport arc, and spatial panels.
- `src/club-screens.js` draws machine demos, game displays, maps, and media title cards.
- `src/club-games.mjs` contains the three mini-games.
- `src/club-audio.js` supplies spatial room effects.
- `src/club-jukebox.mjs` manages the local music library and queue.
- `src/club-cinema.js` manages the official YouTube dialog.
- `club.html` and `club.css` define the native interface. GitHub Pages packaging includes both files, `src/`, and `assets/`.

The supplied results report all 24 focused Node tests and all ten clubhouse browser tests as passed.
The three media browser cases pass again after the final queue-grid and caption fixes.
The MP3 browser tests play real local tracks and seek near their ends to exercise automatic queue advance.
Cinema captures use an explicit test iframe and do not prove live YouTube playback.
IWER provides stereo emulation without a physical headset. Speech checks spy on requests rather than verify audible output.
The fresh finish reviewer returns `ship` for the supplied desktop, mobile, and stereo clubhouse scope with no material fixes.
The club surface brief records the 14 reviewed captures and remaining verification limits.
The full suite against an isolated staged candidate remains in progress at this handoff. These results do not establish its final counts.

## VR cockpit

Select `VR COCKPIT` in the arcade toolbar to open `vr.html`.
The route opens a 3D garage with all nine drivers and all nine car models.
The garage characters reuse the browser game's full-body artwork as colored voxel figures.
Point at a character or car and press a trigger to select it.
Screen mode also supports a click on these objects.

The cars retain the original rear-view artwork and model-specific body proportions, roofs, wheels, and wings.
Your selected paint colors the garage model and cockpit.
Select `START ENGINE`, then `BEGIN CHAPTER` to enter the expressway.
It includes stereo head tracking, tracked controllers, a rear-view mirror, and spatial engine and traffic audio.
The cockpit uses your selected driver, car label, and paint.
Its stylized interior shares one cockpit layout across the car models.

Look right in the cockpit to see your companion.
The mirror shows the crew inside the car.
The selected driver's nitro cameo reuses the browser game's back, profile, and smile poses.
The figure leans out, turns, and smiles during the cameo.
Nitro also produces physical exhaust flames behind the car.

The road includes the original Omarchy and Cliamp logos and pixel signs from the browser renderer.
The final delivery shows the full crew outside the Omarchy arcade.
Select `GARAGE` from a paused cockpit menu to inspect the crew and cars again.
Start a new run to change the driver or car after the race begins.

The VR campaign includes all four chapter objectives, marked pickups, chapter briefings, failure reasons, and the final arcade delivery.
The cockpit dashboard shows the objective, next pickup lane, speed, time, nitro, and checkpoint distance.
VR also shows nitro pickups and pit-stop conversations from the shared engine.
Marked pit areas have openings in the roadside barrier.
Steer onto the indicated shoulder to enter a pit area.
The scene shows both characters, and the dialogue panel shows the current speaker's original full-body artwork.
Select `CONTINUE` through the conversation, then select `BACK TO RACE` to leave with a full nitro charge.

The cockpit also supports the Omarchy rocket and the twenty-second Mars trip.
On Mars, look right to see the outpost's founding-patron displays.

### Enter VR

VR requires WebGL2, a WebXR browser, and a trusted HTTPS address.
`localhost` also qualifies on the device that runs the browser.
An HTTP address on another computer does not provide the required secure context.
Quest browsers and compatible PC VR browsers use the `immersive-vr` session mode.

1. Open `vr.html` from the HTTPS site in your headset browser.
2. Select your driver, car, and paint.
3. Sit in your play position.
4. Select `ENTER VR`.
5. Select `CENTER SEAT` in the cockpit menu.
6. Select `START ENGINE`.
7. Select `BEGIN CHAPTER` after you read the objective.

To select a cockpit control, point at it and press a trigger.

For a USB-connected Quest with developer access, start the local server:

```sh
npm start
```

In another terminal, forward the server port to the headset:

```sh
adb reverse tcp:3000 tcp:3000
```

Then open `http://localhost:3000/vr.html` in the headset browser.

### Headset controls

| Action | XR controller |
| --- | --- |
| Steer | Left thumbstick |
| Accelerate | Right trigger |
| Brake | Left trigger |
| Nitro | Hold A, the lower right face button |
| Pause or resume | B, the upper right face button |
| Center the seat | X, the lower left face button |
| Toggle comfort view | Y, the upper left face button |
| Select a menu control | Point and press a trigger |
| Exit VR | `EXIT VR` in the cockpit menu or headset system menu |

Controllers use the standard `xr-standard` input layout.
In `Grip steering wheel` mode, hold both grips and turn your hands like a wheel.
Release the grips to reset the neutral angle.
Thumbstick input takes precedence over grip steering.
Supported controllers pulse during collisions, close passes, pickups, and checkpoints.

A standard gamepad also works in the cockpit.
Use its left stick to steer, triggers for gas and brake, A for nitro, and B or Start to pause.
Gamepad X centers the view. Gamepad Y toggles comfort view.
In a cockpit menu, A selects the control at the center of your view.

Comfort view reduces peripheral motion at speed.
The cockpit stays level. Head tracking controls the view without artificial camera shake or boost zoom.
The race pauses when tracking stops, the headset opens a system panel, or the VR session ends.
Resume the race explicitly after these interruptions.

### Drive on screen

Select `DRIVE ON SCREEN` to play the 3D campaign without a headset.
Keyboard controls match the arcade race.
Drag the canvas to look around. Press R to center the view.
Touch devices show controls along the bottom of the cockpit.
To switch into VR during a race, pause and select `ENTER VR`.

### VR development

To restore the included Three.js modules after dependency changes:

```sh
npm run assets:vr
```

The server serves the VR route and local modules without a CDN.
The source files are:

- `src/vr-main.js` connects the shared campaign, interface, and frame loop.
- `src/vr-scene.js` builds the 3D city, cockpit, traffic, pickups, and mirror.
- `src/vr-art.js` reuses the browser artwork for voxel characters, car models, the garage, and roadside signs.
- `src/vr-panels.js` draws the headset instruments and menus.
- `src/vr-session.mjs` manages WebXR capability checks and session recovery.
- `src/vr-controls.mjs` maps XR controllers, grip steering, gamepads, and haptics.
- `src/vr-audio.js` adds spatial engine and traffic sources.
- `src/song-player.js` controls MP3 playback on both routes.

Browser checks use IWER for stereo WebXR and controller emulation.
Physical headset comfort, performance, audio, and controller feel still require a hardware test.

## Drivers and garage

The roster contains DHH, Ryan, Bjarne, Tobi, Hancore, Spencer, Krzysztof, Outfoxxed, and Emir.
Each driver has back, profile, and front cameo poses.
Bjarne has a coffee mug and navy jacket. Spencer has a blue shirt.
Hancore uses the supplied skull emblem.
Outfoxxed follows the replacement portrait with swept brown hair, silver-framed glasses, a Tokyo Night blue shirt, and a dark jacket.
The start screen shows all nine drivers in the lower-right corner.
Select that lineup or open `http://localhost:3000/garage.html` to see their larger full-body figures outside the garage.
The garage page supports horizontal scroll on smaller screens and buttons that locate each driver.

The garage contains these models:

- Lamborghini Countach
- Nissan Skyline GT-R
- Toyota Supra
- Mazda RX-7
- Honda NSX
- Porsche 911 Turbo
- Ferrari F40
- Toyota AE86
- Datsun 240Z

Paint choices are Amber, Rose, Orange, Green, Blue, Cyan, Purple, Silver, and Slate.
All nine colors come from Tokyo Night.
The preview updates as you select a color.

## Story campaign

The crew needs a music tape and power cells for the arcade's final night.
Each chapter covers three kilometers and has a different objective.

1. **The Last Tape, Shinjuku:** Collect a cassette from a marked drop.
2. **Lights Out, Shibuya:** Collect two power cells.
3. **Through the Traffic, Akihabara:** Pass six cars.
4. **Before Sunrise, Rainbow Bridge:** Reach the arcade with no more than two collisions.

Collect pickups by driving through their marked lanes.
The HUD shows the objective and the next drop's lane.
Chapter briefings pause the timer until you select `BEGIN CHAPTER`.
Missing an objective at an exit ends the run.
The final chapter ends after a third collision.

Complete all four chapters to reach the sunrise arrival scene and completion screen.
Select `SEE RESULTS` to skip the arrival animation.
Select `PLAY AGAIN` to start another campaign with your saved customization.

## Pit stops

Green pit bays appear at randomized points along the campaign.
Steer onto the indicated shoulder and into the green mark to enter a pit stop.
Drive past the bay to continue without a stop.
After you enter the bay, the car slows and the view changes to the garage.
Another crew member starts a conversation about Omarchy.
The topics cover themes, workspaces, layouts, clipboard history, terminals, screenshots, hotkeys, and window groups.
The dialogue references the local Omarchy manual.

Select `CONTINUE` to advance each exchange.
Select `BACK TO THE RUN` after the final reply.
The race clock pauses during the stop.
The car returns to the same lane and distance with a full nitro tank.

## Mars rocket

A cyan ramp marks the Omarchy rocket on the right shoulder, 850 meters into each chapter until you visit it.
To board the rocket, steer your car into that ramp.
The flight lasts twenty active seconds and carries your selected car to Mars.

| Flight time | Phase |
| --- | --- |
| 0–2 seconds | Cargo closure |
| 2–6 seconds | Liftoff |
| 6–16 seconds | Hyper boost |
| 16–20 seconds | Mars approach |

Pause also stops the flight clock.
The race clock pauses throughout the flight and the Mars visit.
Arrival adds 5000 points once per run.
Select `RETURN TO TOKYO` to resume the campaign.
The car returns to the same lane and distance with a full nitro tank.

### Theme colors and star music

The flight visits all 22 native Omarchy themes in twenty seconds.
Each theme colors the star trails, segmented rings, rocket, and VR cargo cabin.
The HUD shows the theme name, sequence position, and complete palette.
Smooth blends connect the palettes, including transitions between dark and light themes.
Reduced motion keeps the stars and rings stationary while their colors change.

With sound enabled, the rocket plays an original stereo soundtrack with chimes, soft synth chords, bass, and reverb.
Each theme receives a four-note phrase.
Pause stops the music. Resume aligns the music with the flight clock.
The Sound control mutes the soundtrack. The radio or MP3 takes precedence while it plays.
The game creates and caches the soundtrack locally through Web Audio.

`assets/omarchy-themes.js` contains the complete native palettes and their upstream source revision.
It also includes the RGB endpoints from native border-gradient overrides.
To refresh the palettes from an Omarchy Git checkout:

```sh
npm run assets:rocket-themes -- /path/to/omarchy
```

## Founding patrons

The twelve individual [Omarchy founding patrons](https://omarchy.org/patrons/) appear on pixel portrait displays.
Each new run changes their order, roadside positions, and road sides.
The garage page selects three patrons per visit and names them below the scene.
The arcade Mars outpost displays one patron. The VR outpost displays two.

The displays use local `48 × 48` portraits from `assets/patrons/`.
Each PNG includes its official source URL and palette conversion details.
If a portrait cannot load, its nameplate remains visible.
`src/patrons.mjs` records the verified roster and the randomized placements.

To refresh the source portraits:

```sh
npm run assets:patrons
```

## Rules

- Complete each chapter objective before its three-kilometer exit.
- Each of the first three exits adds 35 seconds, 2,500 points, and nitro charge.
- Each mission pickup adds 500 points and nitro charge.
- Each blue nitro canister adds 200 points and 45 nitro charge.
- The optional Mars visit adds 5000 points once per run.
- The final delivery adds 5,000 points and 100 points for each remaining second.
- Each car you pass adds 150 points.
- A close pass adds 450 points and nitro charge.
- A collision reduces your speed and removes three seconds.
- The shoulder reduces your speed.
- Nitro recharges when you release the boost control.
- The browser stores your personal best and sound preference locally.

Roadside advertisements feature Omarchy and [Cliamp](https://cliamp.stream), the TUI music player.
The Cliamp advertisements use the local project's block wordmark and spectrum visualizer design.

The game pauses when its window loses focus.
The reduced-motion preference removes camera shake, speed lines, and car flashes.
Sound starts only after you enable it.

## Development

Install the development packages:

```sh
npm install
```

Run the simulation tests:

```sh
npm test
```

Run the browser checks:

```sh
npm run test:browser
```

The browser checks use Chromium at `/usr/bin/chromium` by default.
To use another browser executable:

```sh
CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

## Cover image

The cover is `assets/tokyo-nights-cover.png`.
It uses a 1:1 square format at 2560 × 2560 pixels.
The composition includes the yellow Countach, Tokyo skyline, pixel title, nitro flames, and DHH cameo.
The Omarchy logo uses the original blocks from `assets/omarchy-logo.txt`.
Its source is [the Omarchy logo file](https://github.com/omacom/omarchy/blob/quattro/logo.txt).

To export the cover again:

```sh
npm run cover
```

The exporter uses the existing game artwork and the local arcade font.
Edit `tools/cover-art.js` to change the composition.

## Shareable cameo cards

The nine individual PNG cards are in `exports/cameo-cards/`.
Each card is a 1080 × 1080 square with a full-body character, name, and Omarchy logo.
The complete set is `exports/cameo-cards.zip`.
The published copies are in `assets/cameo-cards/` and `assets/cameo-cards.zip`.
The garage page links to the complete set and the selected driver's card.

To export the cards again:

```sh
npm run cards
```

The exporter uses Chromium and `zip`.
Each PNG includes its source information in its metadata.

## Music video

The complete music video is `exports/omarchy-tokyo-nights.mp4`.
It contains the supplied song at 1920 × 1080 pixels and 30 FPS.
The duration is 3 minutes and 46.4 seconds.
The file uses H264 video and stereo AAC audio.

To play the interactive preview, start the local server:

```sh
npm start
```

Open `http://localhost:3000/music-video.html`.
Select Play video to start the song.
The preview includes section jumps, a seek control, volume, lyric captions, and fullscreen.
Space controls playback when a form control does not have focus.
The F key controls fullscreen.

The video follows the supplied lyrics through Shinjuku, the expressway, Rainbow Bridge, a tunnel, and Tokyo Bay.
The renderer reuses the game's skyline, rear-view car, traffic, road, and signs.
Additional side views and dashboard shots vary the camera position.
Measured audio accents control exhaust, speed effects, and road reflections.
The audio clock controls all preview frames.
The export renders each frame at a fixed timestamp, which prevents frame-rate drift.

The local speech model supplies vocal timestamps.
The lyric cues retain the supplied text and use reviewed line boundaries.
The subtitles use these timestamps rather than an estimated beat grid.

To export the full video again:

```sh
npm run video -- --overwrite
```

The exporter requires FFmpeg and Chromium.
It uses the same `CHROMIUM_PATH` environment variable as the browser tests.
It requires no Python packages for an export.

To export a short landscape sample:

```sh
npm run video -- --start 64 --duration 8 --output exports/sample.mp4
```

The source files are:

- `assets/omarchy-tokyo-nights.mp3` contains the supplied audio without its embedded cover image.
- `assets/lyrics.txt` contains the supplied lyrics.
- `assets/song-cues.json` contains section boundaries and lyric timestamps in seconds.
- `assets/song-analysis.json` contains measured volume, bass, and audio accents.
- `assets/omarchy-tokyo-nights.srt` contains the timed subtitles.
- `src/song.mjs` maps the audio timeline to shots and effects.
- `src/video-renderer.js` draws the music video.
- `tools/create-video.mjs` exports the MP4.

To change a lyric timestamp, edit `assets/song-cues.json`.
Then export the video again with the command above.
The optional analysis tools use `faster-whisper`, NumPy, and SciPy in a Python environment.
They are not runtime dependencies.

## Social shorts

The five social shorts are in `exports/shorts/`.
Each file uses a 9:16 frame at 1080 × 1920 pixels and 30 FPS.
The shorts contain H264 video, stereo AAC audio, and visible lyric captions.
Each short also has a separate SRT subtitle file.

| File | Passage | Source passage duration |
| --- | --- | --- |
| `01-neon-on-yellow.mp4` | First chorus | 27.50 seconds |
| `02-rain-on-the-asphalt.mp4` | First verse | 26.82 seconds |
| `03-midnight-phantom.mp4` | Second chorus excerpt | 20.15 seconds |
| `04-four-am-run.mp4` | Tunnel bridge | 12.90 seconds |
| `05-tokyo-bay-sunrise.mp4` | Sunrise outro | 23.82 seconds |

The table lists source passage durations from the manifest.
The encoded video can extend by less than one frame at 30 FPS.

The exporter cuts the footage and audio from the completed landscape MP4.
The crop follows the car through each shot.
The sunrise short uses a wider crop to retain both the car and the sun.
The portrait layout replaces the landscape captions with larger, word-timed captions.
The title and captions stay clear of the top and bottom edges.
Short audio fades reduce clicks at the cut boundaries.

To export all five shorts again:

```sh
npm run shorts -- --overwrite
```

To export one short:

```sh
npm run shorts -- --only 04-four-am-run --overwrite
```

To check the format, audio duration, and complete decode of each short:

```sh
node tools/check-shorts.mjs
```

Edit `src/shorts.mjs` to change the passages, titles, or crop positions.
Edit `src/shorts-overlay.js` to change the portrait text layout.
The export manifest is `exports/shorts/shorts.json`.
The `exports/` directory does not enter version control.

## Deploy

GitHub Pages serves the site. The workflow in `.github/workflows/deploy.yml` runs on each push to `master`.

The workflow performs these steps:

1. Install the dependencies with `npm ci`.
2. Run the unit tests with `npm test`.
3. Copy the pages, `src/`, and `assets/` into `_site/`.
4. Upload `_site/` and deploy it to GitHub Pages.

The deploy job shows the site URL on the workflow run page.

To deploy without a push, start the workflow by hand:

```sh
gh workflow run deploy.yml
```

## Source

- `src/engine.mjs` contains the race simulation and rules.
- `src/characters.mjs` defines the available drivers.
- `src/guest-drivers.js` draws the seven additional driver cameos.
- `src/full-characters.js` draws full-body characters for the garage, pit stops, and shareable cards.
- `src/garage.js` renders the crew lineup page.
- `src/garage-scene.js` draws the shared garage backdrop.
- `src/pit-stops.mjs` defines Omarchy conversation topics and crew selection.
- `src/rocket.mjs` defines flight timing, phases, and the Mars bonus.
- `src/rocket-art.js` draws the rocket, flight, and Mars outpost.
- `src/rocket-themes.mjs` maps flight time to the native theme sequence and smooth color blends.
- `src/rocket-score.mjs` defines the original star soundtrack.
- `src/rocket-music.js` renders and plays the soundtrack at the current flight position.
- `src/vr-rocket.js` renders the rocket and Mars outpost in the 3D cockpit.
- `src/patrons.mjs` defines the founding-patron roster and randomized displays.
- `src/patron-art.js` caches the local pixel portraits and nameplates.
- `src/cars.mjs` defines the car models and Tokyo Night paint colors.
- `src/car-sprites.js` draws and colors each car model.
- `src/story.mjs` defines the four chapters, objectives, and item drops.
- `src/omarchy-logo.js` renders the original Omarchy block logo for the start screen and roadside signs.
- `src/renderer.js` draws the original pixel-art skyline, sprites, road, and effects.
- `src/audio.js` synthesizes the engine, effects, and arcade soundtrack with Web Audio.
- `src/main.js` connects the controls, interface, and local storage.
- `src/radio-player.js` manages the car radio, track changes, cancellation, and saved preferences.
- `src/radio-controls.js` creates its accessible stereo controls.
- `radio.css` defines the responsive stereo layout.
- `style.css` defines the responsive arcade interface.
- `assets/arcade.woff2` contains the local Press Start 2P font.
- `assets/FONT-LICENSE.txt` contains the font license.

To restore the font from its source package:

```sh
npm run assets
```
