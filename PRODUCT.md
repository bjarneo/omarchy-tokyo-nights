# Tokyo Nights

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

The user approves plain HTML, CSS, and JavaScript with no build step.

The VR route uses Three.js `0.180.0` through local `assets/three.module.js` and `assets/three.core.js` modules.

## Product Purpose

A playable, old-school pixel-art driving adventure follows a delivery through Tokyo at night.
The four-chapter campaign ends at the Omarchy arcade on Tokyo Bay.

The additional `vr.html` game presents the delivery from a seated, head-tracked 3D cockpit.

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
- `PLAY SONG` controls appear in the arcade toolbar, VR header, and cockpit menus.
- The song starts on request, pauses, and resumes. A pending request supports cancellation, and errors provide a retry message.
- `src/song-player.js` uses `assets/omarchy-tokyo-nights.mp3` independently of the sound toggle. The synthesized tune stops while the MP3 plays.
- Screen focus loss pauses the song. VR visibility or tracking loss pauses the drive and song.
- Browser tests include stereo IWER emulation. Physical headset behavior remains unverified.

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

## Open Decisions

The user does not specify a deployment provider or a framework.
