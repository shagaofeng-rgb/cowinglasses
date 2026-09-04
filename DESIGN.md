# CoWin Glasses Design Direction

<!-- impeccable:design-schema 1 -->

## Chosen World: Lensworld

The glasses are not displayed inside the homepage; the homepage exists inside the glasses. A monumental smart-eyewear frame becomes the interface architecture. Its lenses hold lifestyle worlds, its bridge carries the brand proposition, its brow becomes navigation, and its temple becomes model selection and commerce.

The approved homepage composition is **Lens Tunnel**: three overlapping frame portals create a runway from G200 movement, to GL1 everyday use, to V03-T5 creator context. Desktop presents the three models in depth; mobile unfolds them as one-lens-at-a-time chapters with a sticky commerce bridge.

## Visual Thesis

- Fashion editorial first, product truth immediately visible.
- Oversized optical geometry replaces conventional hero cards and container grids.
- Sport energy comes from diagonal movement, refracted light, blue mirrored lenses and sharp chartreuse actions—not decorative gradients or generic tech glow.
- The experience must feel authored for CoWin rather than borrowed from a conventional electronics shop.

## Color and Material

- Optical black `#090B0C`: frame, type and hard contrast.
- Daylight white `#F5F4EF`: calm commerce surfaces and product facts.
- Lens cyan `#56C6E8`: authentic G200-inspired optical tint and spatial depth.
- Electric chartreuse `#CBEA35`: reserved for active selection, price emphasis and purchase actions.
- Cool silver `#B8C2C7`: technical annotations and hardware detail.
- Materials: matte black acetate/polymer, mirrored blue lens coatings, brushed metal details, crisp outdoor daylight.

## Typography

- Display: a condensed, fashion-editorial grotesk with tight line spacing and decisive scale shifts.
- Interface: a highly legible neutral sans with compact uppercase technical labels.
- Large type may cross lens boundaries, but essential product facts and controls must remain readable without relying on the mask.
- Do not use decorative display faces or default startup typography.

## Spatial Language

- The opening is dominated by one giant frame spanning beyond the viewport edges.
- Navigation follows the brow line; model switching lives along the temple or hinge.
- Each lens reveals a different use context rather than acting as a decorative product photograph.
- Subsequent homepage sections inherit frame, lens, hinge and optical-axis geometry instead of returning to repeated rounded cards.
- Mobile uses one lens at a time as a full-screen chapter, with the bridge becoming a sticky model/price rail.

## Motion

- Slow optical parallax inside lenses, subtle lens-reflection movement, and scene crossfades when switching models.
- Scroll transitions feel like looking through a new lens rather than sliding generic sections.
- No essential information depends on motion; `prefers-reduced-motion` receives instant state changes and static compositions.

## Implemented Homepage Surfaces

- Opening lens tunnel: `src/components/home/home-page.tsx` and `lensworld.module.css`.
- Homepage-only dark navigation treatment: `src/components/layout/header.tsx`.
- Generated scene sources: `public/images/home/lensworld/` with prompt provenance in `.impeccable/assets/lensworld-scenes.json`.
- Product imagery, prices, links and specification values continue to come from the existing product repository/fixtures.
- Six localized Lensworld UI dictionaries live in `src/messages/index.ts`; product content keeps the existing English fallback behavior.

## Commerce Rules

- Real product name, verified price and direct purchase path appear in the first viewport.
- G200 leads with USD 39.99 and only its confirmed capabilities: open-ear Bluetooth audio, calls, sunglasses, 5–6 hour music playback and 43 g weight.
- Other models use only verified fixture data. Generated lifestyle scenes are art direction, not evidence of unverified features.
- Language, currency, support, search and cart remain obvious global controls.

## Accessibility and Internationalization

- All controls retain keyboard focus, accessible names and sufficient contrast.
- The optical composition must gracefully flatten when text expands.
- Arabic mirrors navigation, sequence, directional icons and text alignment while preserving the frame concept.
- Mobile is a first-class composition, not a cropped desktop image.
