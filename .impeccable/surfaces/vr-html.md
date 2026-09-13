---
version: 1
slug: "vr-html"
primary_target: "vr.html"
related_targets: ["vr.css", "src/vr-main.js", "src/vr-scene.js", "src/vr-controls.mjs", "src/vr-session.mjs", "src/vr-audio.js"]
---

# VR race surface

## Scope

This surface uses Experience mode. The user confirms WebXR headsets and a seated cockpit with tracked controllers.
The primary action enters immersive VR. A screen mode provides the same 3D race without a headset.

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

### FIRST VIEWPORT

A compact setup panel sits left of the full-viewport cockpit preview on desktop.
The road remains visible beside the panel. Mobile places the panel below a shorter cockpit preview.
The dashboard carries speed, time, charge, and checkpoint distance in the headset.

### FORM

The confirmed seated WebXR cockpit extends the established direction from seed `6ddbd526`.
This code-led addition uses local Three.js modules and the existing race engine.
The cockpit remains level. Head tracking controls the view without camera shake or boost zoom.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
