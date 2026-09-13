# W-C notes (R-10 visual identity concepts)

- Read brief, PRD R-10 cell line, D-29..D-33, D-46. Opened design-craft SKILL.md and floor.md.
- Route: inline (brief asks for local HTML concepts, no canvas). Floor applied: no accent bars, no eyebrows, no gradient text.
- Rule breaks, named: brief requires system font stacks (no CDN), which the floor's "system display face" refuse item would otherwise flag; brief wins. Eight-artboard rule narrowed: each concept is one responsive page with light and dark themes (prefers-color-scheme plus a toggle) rather than eight separate artboards, because the brief asks for a single page per concept.
- Wrote concept-a (Instrument, nerf-bench), concept-b (Public Record, proposes Driftwatch), concept-c (Foam, nerf-bench), index.html.
- uiscan first pass: A clean; B and C flagged cream-palette (backgrounds changed to #eef1ef, #f7f8fa); index flagged flat-type-hierarchy (headings enlarged). Second pass all four CLEAN, exit 0. Reports saved as *.uiscan.txt via editor.
- R-10.cjs: checks >=2 concept-*.html, name/logo text (title, brand block, svg) free of Claude/Anthropic, report beside each whose last scan has a CLEAN line and no findings.
- R-10 run: exit 0. Control (concept-c report removed): exit 1, restored. No en or em dash in design/, R-10.cjs or this file.
- uiscan usage: `uiscan.cjs <file...> [--json] [--root <dir>]`.
