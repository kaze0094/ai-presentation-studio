# COFFEEVERSE 3D World — development snapshot

This isolated branch contains the RPG world interaction prototype and rollout guidance. A new procedural WebGL standalone build has been generated for user review as `COFFEEVERSE_3D_WORLD.html` alongside `COFFEEVERSE_3D_COMPANION.pptx`. Those binary/large generated artifacts are currently delivered as conversation downloads, **not committed into this repository**.

## Implemented in the delivered preview
- Real independently generated WebGL triangle meshes for island terrain, coffee bushes, trees, village buildings, academy, drying trays, factory and roaster, trucks, crates, container ship, and final hall.
- Perspective camera smooth fly-to and cursor-responsive offset; pointer-based 3D destination proximity picking and accessible destination buttons.
- Six destinations mapped to 17 slides; Speaker Notes, APA references, keyboard navigation and fullscreen.
- Illustrated non-WebGL fallback for browsers without WebGL.
- A separate 17-slide editable companion PPTX with speaker notes and two-font typographic system.

## Known verification limitations
- Chromium in the current execution environment denies a WebGL context, so the full 3D render is not visually smoke-tested here. Tested: HTML load, fallback render, destination selection, next-slide navigation, and notes.
- PPTX passes structural check: 17 slides, 17 notes. Projection legibility and text-fit still require user visual review.
- The repository's Presentation JSON 1.0 currently does not support chapter maps/3D effects, so the standalone HTML must not be represented as fully integrated into its current React export system.
- Do not merge into main or describe production readiness without full WebGL browser verification, schema integration, and slide QA.

## Source and release plan
Integrate the standalone WebGL world into the React Studio on this feature branch, update schema in a backward-compatible way, ensure approved educational text and citations are unchanged, run build/tests, and obtain explicit human approval before merging.
