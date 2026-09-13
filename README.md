# Tokyo Nights

A pixel-art arcade racer with a yellow Lamborghini Countach and the Tokyo Night palette.
Drive through four Tokyo districts on an endless expressway.

## Play

Start the local server:

```sh
npm start
```

Open `http://localhost:3000` in your browser.
The game needs no build step or runtime packages.
The local font, sprites, and audio work without external requests.

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
Road motion, roadside lights, speed streaks, and the nitro camera response emphasize acceleration.
Choose DHH or Ryan before each new run.
Use the arrow keys or tap a portrait to select a driver.
Press Enter or select the drive button to start.
The browser remembers your last confirmed driver.

The first boost introduces your selected driver.
Later boosts have a 35% chance of a cameo after a 20-second cooldown.
The driver leans out, turns toward you, smiles, and returns inside the car.
DHH has wavy brown hair, blue-gray eyes, and a short beard based on the supplied reference photo.
Ryan has glasses, swept-back hair, and a goatee based on the supplied reference photo.

## Rules

- Reach each checkpoint within three kilometers before the timer expires.
- Each checkpoint adds 35 seconds, 2,500 points, and nitro charge.
- Each car you pass adds 150 points.
- A close pass adds 450 points and nitro charge.
- A collision reduces your speed and removes three seconds.
- The shoulder reduces your speed.
- Nitro recharges when you release the boost control.
- The browser stores your personal best and sound preference locally.

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
- `src/omarchy-logo.js` renders the original Omarchy block logo for the start screen and roadside signs.
- `src/renderer.js` draws the original pixel-art skyline, sprites, road, and effects.
- `src/audio.js` synthesizes the engine, effects, and arcade soundtrack with Web Audio.
- `src/main.js` connects the controls, interface, and local storage.
- `style.css` defines the responsive arcade interface.
- `assets/arcade.woff2` contains the local Press Start 2P font.
- `assets/FONT-LICENSE.txt` contains the font license.

To restore the font from its source package:

```sh
npm run assets
```
