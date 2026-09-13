# Tokyo Nights

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The user approves plain HTML, CSS, and JavaScript with no build step.

The VR route uses Three.js `0.180.0` through local `assets/three.module.js` and `assets/three.core.js` modules.

The clubhouse reuses these local modules, `VRArt`, `VRSession`, and the shared MP3 player.

## Product Purpose

A playable, old-school pixel-art driving adventure follows a delivery through Tokyo at night.
The four-chapter campaign ends at the Omarchy arcade on Tokyo Bay.

The additional `vr.html` game presents the delivery from a seated, head-tracked 3D cockpit.

The additional `club.html` room provides free exploration of a 1980s computer club with approachable characters and interactive hardware.

## Capabilities and Constraints

- The game uses a behind-the-car view rendered with 2D graphics.
- The game includes traffic, curved roads, and a nitro boost.
- The game supports keyboard and touch controls.
- The user requests higher driving speeds and a stronger visual sense of speed.
- The user requests a long-haired DHH cameo during nitro boosts.
- The user supplies a DHH photo as the reference for his portrait and cameo poses.
- DHH leans out of the window, turns toward the player, smiles, and returns inside the car.
- The user requests Ryan as a second character, based on the supplied photo.
- The player selects from nine drivers before each new run.
- The roster adds Bjarne, Tobi, Hancore, Spencer, Krzysztof, Outfoxxed, and Emir from the supplied references.
- The user requests color for Bjarne and Spencer.
- The replacement Outfoxxed portrait defines his human cameo and full-body character.
- The player selects from nine car models and nine Tokyo Night paint colors.
- The user requests a finite story with an ending.
- The chapters require a cassette, two power cells, six overtakes, and a final drive with at most two collisions.
- The user requests a separate garage page with larger, full-body characters.
- The user requests longer nitro and randomized nitro pickups.
- Randomly placed, optional pit bays pause the drive for conversations about Omarchy with another crew member.
- The player must steer into a marked roadside bay to enter a pit stop.
- Completing a conversation returns the player to the same run.
- The user requests nine individual PNG cameo cards to share with the people represented.
- The user requests occasional cameos rather than an appearance during every boost.
- The user requests a Tokyo Night blue shirt for Outfoxxed.
- An optional Omarchy rocket accepts the selected car through a cyan ramp on the right shoulder.
- The rocket reaches Mars after twenty active seconds through cargo closure, liftoff, hyper boost, and descent.
- The user requests all native Omarchy theme colors and star music during the rocket flight.
- The flight visits all 22 native theme palettes, including RGB colors from border-gradient overrides.
- Colored star trails, segmented rings, rocket paint, and cabin light follow the palette sequence.
- The flight HUD names each theme and shows its complete color strip.
- An original stereo chime melody, synth chords, bass, and reverb follow the active flight clock.
- The star soundtrack follows the Sound control. The MP3 control takes precedence over synthesized music.
- Pause stops the soundtrack. Resume and a mid-flight sound toggle align it with the current flight time.
- Reduced motion retains smooth palette changes with stationary star trails and rings.
- The flight and Mars visit pause the campaign clock. The return action resumes the same run with full nitro.
- The Mars arrival awards 5000 points once per run.
- The user requests randomized placements for the individual founding patrons from `https://omarchy.org/patrons/`.
- Twelve local pixel portraits appear on randomized roadside signs and garage or Mars displays.
- Patron selections use a separate random source from traffic and pickups.
- The garage caption names its three displayed patrons and links to the official roster.
- The game runs in a browser from a local static server.
- The music video uses the supplied song and lyrics with the game's pixel artwork.
- The music video exports at 1920 × 1080 pixels and 30 FPS.
- The social export creates five 9:16 shorts from the completed MP4.
- Each short includes the source audio and larger, word-timed lyric captions.
- The user confirms seated WebXR headsets with tracked controllers for the additional VR game.
- The VR route uses stereo `immersive-vr` sessions. WebXR requires HTTPS or localhost on the host device.
- Screen mode supports the same 3D campaign with keyboard, touch controls, and a standard gamepad.
- VR shares the existing driver, car, paint, and best-score storage. It also stores the steering mode and comfort preference.
- The cockpit supports thumbstick or two-controller grip steering, controller-ray menus, seat centering, pause, and exit.
- Comfort view reduces peripheral motion at speed. The cockpit stays level as head movement controls the view.
- VR includes chapter briefings, objectives, marked pickups, failure reasons, and the final Omarchy arcade delivery.
- Spatial engine and traffic audio follows the head pose. Supported controllers provide event pulses.
- The user requests original browser-game art and visible characters throughout VR.
- `src/vr-art.js` reuses the browser renderer's full-body characters, face poses, car sprites, garage facade, block logos, and pixel signs.
- The VR garage contains all nine voxel characters and nine model-specific 3D cars. Controller rays and screen clicks select crew members and cars.
- Native VR setup shows the selected full-body character and car in preview canvases with updated captions and accessible labels.
- `GARAGE` and `COCKPIT` controls switch views from the toolbar and headset menu. A switch during a drive pauses the race.
- The selected driver has a visible seated body and appears in the mirror. A second crew member occupies the passenger seat.
- VR uses the original boost cameo poses to make the selected driver lean out, turn, and smile.
- VR traffic uses original car rear textures. The road includes branded signs, nitro pickups, and optional pit areas with guardrail openings.
- VR pit conversations show both physical characters. The headset panel also shows the current speaker's original full-body artwork.
- All nine voxel characters appear at the final Omarchy arcade.
- `advanceVRSimulation` processes elapsed time in steps of at most `1/60s`, including the final smaller step. Each frame accepts at most `0.25s`.
- The user requests a button to start the supplied MP3 song.
- The user requests an in-car radio with songs from `radio.omarchy.org`.
- The car radio uses a verified local catalog of 33 community songs and streams their audio after a playback action.
- The stereo offers play, pause, previous, next, track selection, and volume controls with saved track and volume preferences.
- The next song starts when a track ends. The playlist wraps after the last song.
- The radio and local MP3 use exclusive playback. Both take precedence over synthesized music.
- The VR cockpit includes a physical stereo with controller-ray transport and volume controls.
- Focus or headset visibility loss pauses the radio. Loading, cancellation, and retry states retain usable controls.
- `PLAY SONG` controls appear in the arcade toolbar, VR header, and cockpit menus.
- The song starts on request, pauses, and resumes. A pending request supports cancellation, and errors provide a retry message.
- `src/song-player.js` uses `assets/omarchy-tokyo-nights.mp3` independently of the sound toggle. The synthesized tune stops while the MP3 plays.
- Screen focus loss pauses the song. VR visibility or tracking loss pauses the drive and song.
- Browser tests include stereo IWER emulation. Physical headset behavior remains unverified.

### Retro clubhouse

- The user selects smooth walk plus teleport and free exploration without a main objective.
- The furnished room measures `36 × 28m` and contains six areas, 21 interactive stations, and all nine original voxel characters.
- The original 19 stations remain. The entrance jukebox and lounge cinema CRT add two stations.
- The original Omarchy block logo marks the main wall and the DHH shirt.
- Each original character has a distinct gesture. Arm inverse kinematics controls the coffee raise, hold, tilt, and lower sequence.
- Short autonomous walks respect collisions and reserve map destinations, machine approach points, and conversation-panel space.
- Characters stop their walks within `3.2m` of the player or during their own conversation.
- Characters use a calibrated `1.95m` standing height. The player eye height is `1.65m`.
- Reduced motion stops autonomous walks and gestures. Player-controlled movement, character orientation, and machine demos remain available.
- Five gallery panels display 65 original project marks from local assets, with source evidence and installation scopes.
- The gallery distinguishes foundations, base packages, and optional software. It explicitly excludes GNOME, GTK, and Qt.
- The marks use pinned `simple-icons` version `16.31.0`, upstream artwork, and the original Omarchy and Cliamp block logos.
- The gallery manifest records Omarchy source commit `760a546a1c883d9bf3f33e3675920318fbf3fe76`, source URLs, licenses, and hashes.
- The four gallery PNG files retain embedded source provenance.
- Each character offers a greeting and three scripted topic responses. The player can return to any topic or leave the conversation.
- Optional `READ ALOUD` uses the browser's system voice. Dialogue remains visible when speech is unavailable.
- Canceled or interrupted speech does not report a voice failure.
- Computer stations include Amiga 500, Amiga 1000, Commodore 64, ZX Spectrum, and Atari 520ST.
- Other computers include IBM PC XT, Apple IIe, Macintosh 128K, and Amstrad CPC 464.
- Console and handheld stations include Nintendo NES, Famicom, Game Boy, Sega Master System, Mega Drive, and Atari 2600.
- Three cabinets provide Star Patrol, Brick Break, and a Tokyo Nights portal. A cassette deck controls the supplied MP3 song.
- Hardware screens use menu-driven interactive recreations and original JavaScript demos. They do not load ROMs or emulate the original processors.
- Computer demos include recreated desktops, fixed BASIC examples, a local BBS, checker ball, starfield, color tests, and three MIDI patterns.
- The Macintosh sketchpad supports a `16 × 12` grid with cell selection, erasure, and a clear action.
- Star Patrol, Brick Break, and Snake are original club mini-games. Selected console stations reuse these games.
- Mini-game panels include `PAUSE`. Panel `PAUSE`, toolbar `PAUSE`, and keyboard `P` preserve the active round for resume.
- Completed rounds update per-game personal bests under `tokyo-nights.club.best`. Blocked storage permits play with in-memory scores.
- Head-relative movement runs at `4.2m/s`. Wall, furniture, station, and character collisions constrain smooth movement.
- The right stick provides `30`-degree snap turns. Floor teleport checks its arc and destination against obstacles.
- The map provides six clear destination points. Characters and stations require proximity within `3m` and a clear interaction path.
- Screen mode supports keyboard, pointer, touch controls, and a standard gamepad. WebXR supports tracked controller rays and headset movement.
- A held controller button activates a menu action once across ordinary state transitions.
- The original MP3 controls support play, pause, resume, cancellation, and retry. The room sound control operates independently.
- The physical jukebox plays 33 local MP3 files from the sibling `radio.omarchy.org/public/tracks/` source.
- `assets/club-radio.js` and `assets/radio/playlist.json` retain source order, titles, artist credits, explicit flags, and SHA-256 hashes.
- Library and queue pages contain up to six tracks. The controls support immediate play, queue append, removal, and clear.
- Next-track actions and track completion consume the queue first, then continue through the sequential library with wraparound.
- Playback supports pause, resume, load cancellation, and retry. The jukebox and original song use exclusive playback.
- The user approves official YouTube playback for `Bic2KjFFj6w` through the large lounge CRT's station action.
- This action ends XR before a native browser dialog creates the official iframe. It pauses the room and stops other music.
- The dialog provides retry and `OPEN ON YOUTUBE`. Close removes the iframe and returns to exploration.
- The physical CRT shows a title card. Video playback uses the browser dialog, with no VR video texture or local download.
- Spatial sound includes machine fans, interaction tones, modem tones, and the Atari ST pattern demo.
- Screen focus loss or XR visibility or tracking loss pauses activity. Pause retains the current conversation or mini-game for resume.
- Focus and session recovery suppress held face-button menu actions until release.
- The game page provides the `THE CLUB` masthead link, `RETRO ROOM` toolbar link, and `.club-visit` banner.
- The VR route provides a native clubhouse link and a headset-menu portal.
- Clubhouse navigation and the Tokyo Nights cabinet link to the VR race and garage.
- GitHub Pages packaging includes `club.html`, `club.css`, the clubhouse source modules, and local media assets.

## Brand Commitments

- Use the Tokyo Night color scheme.
- Use the yellow Lamborghini Countach as the default car.
- Preserve the old-school pixel-art style.
- Use the supplied Omarchy logo on the start screen and roadside signs.
- Add roadside advertisements for Cliamp, the TUI music player, using the local project's branding.
- Show all nine characters in a lineup at the lower-right of the start screen.
- The garage scenes show Omarchy branding without Cliamp advertisements.
- Extend the Tokyo Night colors, Arcade and Courier New type, and rectangular controls into procedural low-poly VR geometry.
- Reuse the original browser-game character, car, garage, logo, and sign artwork throughout VR.
- Use the original voxel crew with beige computers, curved CRTs, wood furniture, and patterned carpet in the clubhouse.

## Open Decisions

The user does not specify a deployment provider or a framework.
