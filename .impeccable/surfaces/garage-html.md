---
version: 1
slug: "garage-html"
primary_target: "garage.html"
related_targets: ["garage.css", "src/garage.js", "src/garage-scene.js", "src/full-characters.js", "src/renderer.js", "src/patrons.mjs", "src/patron-art.js"]
---

# Garage lineup

## Scope

Experience mode. The user requests a separate page with larger, full-body characters outside a garage.

## Direction contract

### THESIS

All nine drivers stand together outside the Omarchy garage as full-body pixel characters.

### OWN-WORLD

Inherit the established Tokyo Night palette, Arcade lettering, block logo, and pixel artwork.
The garage contains no Cliamp advertisements.

### STORY

The visitor sees the full crew, locates a driver by name, and returns to the game.
Three randomized founding-patron portrait displays hang on the garage shutters.
A text caption names those patrons and links to the source roster.

### FIRST VIEWPORT

A compact header and pink title introduce a wide garage scene.
The character row stays large on smaller screens through horizontal scroll.
Name buttons locate each figure and display its description.

### FORM

The user pins the garage and full-body lineup within the world established under seed `6ddbd526`.
The page uses procedural artwork and a native horizontal scroll area.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implemented patron extension

### Displays and selection

`src/garage.js` selects three distinct IDs from `createPatronTour().garage` for each page visit.
The source roster contains twelve official individual founding patrons from `https://omarchy.org/patrons/`.
The shared tour algorithm uses the first three shuffled IDs for the garage and the next two for Mars.

`Renderer.drawGarage` places three posters on the shutters above the crew.
Poster centers sit at `19.5%`, `50.8%`, and `82.1%` of the canvas width. Their top edge sits at `29%` height.
Each poster uses `15.5%` of the canvas width and preserves the `160:88` aspect ratio.
The existing `1280px` minimum artwork width and horizontal pan preserve the wide scene on mobile.

### Caption and materials

- `#garage-patrons` names the three displayed patrons below the scene. The canvas accessible label includes the same names.
- `.crew-patrons` reuses `crew-body` with `14px` Courier New, line height `1.8`, muted text, and a `12px` top margin.
- The source link uses yellow `12px` text, line height `2`, and the existing `2px` cyan focus outline with `5px` offset.
- The caption wraps within the page while the poster row remains inside the horizontal scroll area.
- Each cached `160 × 88` nameplate uses a `2px` green frame, indigo fill, a `48 × 48` portrait, and name and company text.
- The local PNGs map official portraits to Tokyo Night colors and local skin tones. Image smoothing stays disabled for scene composition.
- Missing portraits retain initials, names, companies, and source text. The garage controls and caption remain available.
- All twelve portrait PNGs embed the official source URL and palette conversion details under `impeccable:prompt`.

The extension reuses the Shared Palette Rule, the existing garage support type, and rectangular link and focus conventions from `DESIGN.md`.
The source roster and portrait cache live in `src/patrons.mjs` and `src/patron-art.js`.

## Extension verification evidence

- `.impeccable/review/patrons-garage-desktop.png` shows all three shutter posters and their caption.
- `.impeccable/review/patrons-garage-mobile.png` shows the horizontal scene and wrapped caption with the source link.
- `.impeccable/review/patrons-atlas.png` shows all twelve portrait nameplates.
- The supplied results report all five checks in `tests/browser/patrons.spec.js` passed.
- Garage checks cover desktop and mobile under a site subpath, local portrait requests, the caption, accessible names, and page overflow.
- The missing-portrait case retains a usable garage and driver controls.
- The supplied raster scan reports `21` PNG assets and `0` missing provenance records.

The scoped two-fix verdict and complete extension test counts appear in `.impeccable/surfaces/index-html.md`.
That verdict covers the mobile rocket ramp and VR Mars posters at desktop, mobile, and IWER scope.
