---
name: add-furniture
description: Use when the user wants to add a piece of furniture, an appliance, a light or a layout variant to a project, from a datasheet, a dimensioned drawing, a photo or plain measures. Models it as a switchable group so variants can be compared in the viewer.
---

# Add furniture or a variant as a switchable group

Everything the user can switch on and off in the viewer's **Groups** panel is a group. Furniture and variants always live in groups; the fixed shell (walls, floor) never does. Reply in the user's language; repo files stay English except the user's project data.

## MANDATORY RULES (user, imperative, never skip)
1. **Every object you add is movable as one piece**: put it in a group that is NOT `fixed`, and give all its leaf names the same first word with no digits (letters instead: `Part_a`, `Part_b`), so the viewer's move key is one per object. This includes things built like walls (a header wall above a door belongs to the door's group); verify with `mvState` after a double click that the whole object has one key.
2. **An object added to an alternative version is also added to the base version** (`projects/casa-poggi/`), with the same code, but hidden there: its group is left out of the base's `defaultOn`, so it is off until ticked in Groups.

## REALISTIC LOOK RULES (user, imperative, never skip; also required in every pull request)
Every object you add must keep the project's realistic look (`look: 'real'`):
1. **Materials from what it is really made of**: add its items to the generator's finish table (`ro`: polished stone 0.3, varnished wood 0.4-0.45, lacquer / painted joinery 0.45-0.5, matt tile 0.6, fabric / fur 1, glass via alpha < 255) and to the relief table (`bp`: grain / ribs / grout / plank gaps for a textured surface, small noise for plaster and fabric; polished or smooth things get none). Write the material in a comment; mark guesses `// estimate`.
2. **Shapes**: group `box` / `rbox` / `tube` (cut edges apply automatically to opaque, untextured group boxes); keep the scene light (no meshes with thousands of triangles, no new image above ~1.5 MB, WebP textures).
3. **Light stays real**: never add a lamp, bulb, ceiling light or night glow unless the user asks; at night the only light is the existing lamp; by day light enters only through the existing windows and doors. If a lamp is requested: `kit.light({ p, i, sh: 1, g })` just below the shade and `em: 1` on the shade.
4. **Verify like the rest**: day and night screenshot of the new object, `npm test`, and the PR description lists these four points as done.

## 1. Understand what to add
Ask only what is missing, one question at a time:
- which project and which room (and where in it: against which wall, how far from a corner);
- what it is and its overall size (W x D x H in cm); if the user has a **datasheet or dimensioned drawing** (they may paste a PNG), read it into a small table first: overall W/D/H, body depth, door depth, handle protrusion, rear spacers, foot height, split lines. Drawings often give two depths (body, and body + door + handle): the door is a separate part that sticks out. Convert mm to cm. Say back what each number was taken to mean and what is a guess (hinge side, colours) and wait for a correction;
- is it **a new piece** or **an alternative to an existing one** (a variant: only one of them can be on at a time).

## 2. Check the space before drawing
- Run `node scripts/plan-report.mjs <id>`: is the wall long enough, is the clear room size what you assumed?
- Look at neighbours: other groups on the same wall, door swings, radiators, windows. After coding, run a numeric overlap check of the new boxes against the wall boxes and against the other items and report overlaps above 1 cm and any blocked clearance (door that cannot open, aisle under 60 cm).

## 3. Model it
In the project's generator (`project.json` `generator`), using `scripts/scene-kit.js`:
```js
kit.defGroup('wardrobe-v2', 'Wardrobe v2: 2 x 100 cm with mirrored doors', 'Bedroom', 'wardrobe');   // id, label, category, [variant]
kit.group('wardrobe-v2', () => {
  box('/Room/Wardrobe_v2/Body', WHITE, x0, y0, 0, x1, y1, 240);
  // ...
});
```
- **Variants**: groups sharing the same last argument (`'wardrobe'`) exclude each other; independent pieces have none. List the ids that should start switched on in `createScene({ defaultOn: [...] })`.
- **Unique leaf names** (`/Room/Wardrobe_v2/Body`, not `/Body`): the viewer, hover and dimensions use them.
- **Shapes**: `box` for anything axis-aligned (shelves, doors as thin boxes with a 0.5 cm gap, handles as boxes or 0.8 cm `tube`s 1-2 cm off the face); `rbox` for rounded worktops, shades, appliance bodies; `tube` (14-20 segments for round stools and jars) for legs and handles; `slab` for any polygon in plan (a rotated or corner piece), `tray` for basins. The viewer cannot rotate a box: rotate in plan with `slab`, or map your own local frame.
- A new variant of a module = copy the base module, rename the group id and the item prefix, change only the block that differs (transplant a block from another variant with the same coordinates). Several modules can share a file; large ones get their own file required by the generator.
- **Lights** (a pendant, a spot): `kit.light({ p: [x, y, z], i: ..., sh: 1, g: '<group id>' })` just below the lamp, and mark the shade `em: 1` on the item if it should glow at night; a lamp without a `light` entry only looks like one.
- Estimates (colours, hidden thicknesses) get an `// estimate` comment, measured values `// measured`.

## 4. Verify and show
1. Regenerate (`node projects/<id>/<generator>.js`) and run `npm test` (also checks that `scene.json` equals the generator's output).
2. Show it: headless screenshot of `/<id>/?g=<group ids>&cam=...` or ask the user to open `/<id>/` and tick the group; compare variants side by side when there are several.
3. Ask what is next: adjust it, add the alternative, move on. Do not commit or push without asking; `check-and-publish` does that cleanly.
