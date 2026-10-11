# COFFEEVERSE RPG World — implementation plan

This branch is an isolated development branch. Do not merge to main without explicit approval.

## Experience
Five destinations: Coffee Village (slides 1–3), Theory Academy (4–7), Highlands Farm (8–10), Export Harbor (11–14), Final Brew Hall (15–17).

Web mode: navigable isometric RPG-style map; click a destination to reveal its learning chapter; keyboard navigation; optional cinematic camera motion; reduced-motion fallback; accessible navigation; English academic content; APA citations.

PPTX mode: 16:9 editable text, charts, and shapes; speaker notes; references; matching colors, world markers, and visual hierarchy. Web-only camera motion must not be represented as native PPTX 3D.

## Compatibility issues in Presentation JSON 1.0
- metadata.language only permits "vi"; English presentation needs a new compatible schema version or separate view language.
- theme.id only permits "studio-dark"; Coffeeverse theme needs explicit schema support.
- content.blocks maxItems=1; diagrams and mixed charts require a revised content model.
- design.layout allows only hero/content/closing.
- effect.id allows only none and threeui.constellation.
- Agent revisions and approval must be preserved; migration must invalidate prior approvals.
- All content, figures, sources, notes must be shared across WEB and PPTX.

## Release gates
1. Validate the schema migration and regression-test the old demo.
2. Build and test the new web renderer, including reduced-motion and no-WebGL fallback.
3. Export and inspect PPTX including all speaker notes.
4. Verify slide count, APA references, timing, and academic English.
5. Request explicit human approval before merging into main.

## Academic integrity
Do not treat observed coffee exports as proof of comparative advantage or a formal test of the Heckscher–Ohlin theorem. RCA is descriptive, not causal. Do not fabricate an RCA score. The presentation remains 16 content slides + 1 APA references slide.
