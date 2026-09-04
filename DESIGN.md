---
name: "CoWin Glasses"
description: "A fashion-led smart-eyewear storefront built as an optical instrument."
colors:
  optical-black: "#090b0c"
  deep-panel: "#0b0d0e"
  optical-ink: "#101214"
  daylight-paper: "#f5f4ef"
  surface-white: "#ffffff"
  action-chartreuse: "#cbea35"
  lens-cyan: "#56c6e8"
  lens-pale: "#dceaf0"
  lens-mist: "#e4eef1"
  cool-silver: "#b8c2c7"
  muted-graphite: "#596065"
  divider: "#cdd1cf"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(4rem, 8vw, 7.8rem)"
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(3.25rem, 6vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.65rem, 2.8vw, 2.3rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Manrope, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  control: "10px"
  panel: "14px"
  optical: "46% 50% 45% 48% / 43% 44% 53% 52%"
  circle: "50%"
spacing:
  control-y: "0.8rem"
  control-x: "1.25rem"
  panel: "1.5rem"
  section: "clamp(3.5rem, 7vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.action-chartreuse}"
    textColor: "{colors.optical-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.25rem"
    height: "3.1rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.optical-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.25rem"
    height: "3.1rem"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.optical-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "3.4rem"
  optical-media:
    backgroundColor: "{colors.lens-pale}"
    rounded: "{rounded.optical}"
    padding: "clamp(1rem, 3vw, 2rem)"
  summary-panel:
    backgroundColor: "{colors.deep-panel}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.panel}"
    padding: "1.6rem"
---

# Design System: CoWin Glasses

## Overview

**Creative North Star: "Lensworld"**

CoWin behaves like an optical instrument, not a conventional ecommerce template. Matte-black structure, blue optical fields, off-white editorial space, and a rare chartreuse action signal turn eyewear hardware into the organizing language of the interface. The approved homepage Lens Tunnel is the most expressive form of this world; the rest of the storefront inherits its lenses, frames, hinges, and optical axes without cloning its composition.

The system is fashion-editorial in scale and product-operational in use. Product truth, real prices, configuration, shipping, and support remain legible on rectangular surfaces while optical silhouettes hold imagery and atmosphere. Dense tasks become numbered stages or ruled data rails rather than collections of generic cards.

**Key Characteristics:**

- Condensed, oversized display typography paired with compact, highly legible interface copy.
- Matte dark chrome against quiet daylight-paper content fields.
- Blue lens geometry reserved for imagery, spatial depth, and branded atmosphere.
- Chartreuse used as a scarce action and state signal.
- Thin rules, asymmetric splits, and optical masks instead of repeated soft containers.
- Mobile and RTL layouts recomposed intentionally, never cropped from desktop.

## Colors

The palette alternates hard optical structure with calm editorial reading surfaces; cyan creates depth, while chartreuse remains deliberately scarce.

### Primary

- **Optical Black:** The dominant frame, header, hero, and high-contrast structural color.
- **Action Chartreuse:** The primary purchase, selected-state, price-emphasis, focus, and directional signal.

### Secondary

- **Lens Cyan:** The authentic blue optical tint used in lens coatings, atmospheric fields, and refracted depth.
- **Lens Pale:** The product-imagery field that keeps hardware legible while retaining the optical metaphor.
- **Lens Mist:** A restrained hover, band, and editorial support surface.

### Neutral

- **Optical Ink:** Primary type, hard rules, and controls on light surfaces.
- **Deep Panel:** Configuration consoles, summaries, status states, and other contained dark surfaces.
- **Daylight Paper:** The default reading and commerce background.
- **Surface White:** Inputs, selected thumbnails, and the brightest content surfaces.
- **Cool Silver:** Secondary information on dark fields and hardware-adjacent detail.
- **Muted Graphite:** Supporting copy on light fields.
- **Divider:** Low-contrast rules and boundaries.

### Named Rules

**The One Signal Rule.** Keep one visually dominant chartreuse action per viewport; secondary actions rely on outline, text, or white contrast.

**The Optical Field Rule.** Blue belongs to lenses, product media, and atmospheric depth, not to generic page backgrounds or arbitrary UI decoration.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, Helvetica Neue, and sans-serif fallbacks)

**Body Font:** Manrope (with Arial, Helvetica, and sans-serif fallbacks)

**Character:** Barlow Condensed provides the compressed, fashion-editorial voice required for product names and route-scale statements. Manrope keeps prices, specifications, forms, policies, navigation, and multilingual commerce calm and highly legible.

### Hierarchy

- **Display:** Semibold, tightly tracked, and dramatically fluid; reserved for first-view route statements and the largest brand moments.
- **Headline:** Semibold and compact; used for major product-detail, editorial, and task-section headings.
- **Title:** Semibold with tight line spacing; used for product names, cards, and local section titles.
- **Body:** Regular with generous leading; used for explanations, policies, product facts, and form guidance, with reading content constrained to roughly 64–68 characters.

### Named Rules

**The Two-Voice Rule.** Condensed display type creates identity; neutral body type carries every fact and task. Do not use display type for long-form or form content.

**The Tight Display Rule.** Large headings use compact line height and controlled measure, but essential copy and controls never depend on clipping, overlap, or a lens mask to remain readable.

## Layout

The global shell is fluid with a maximum width of 1440px and one-rem minimum side gutters. Major sections use a responsive vertical rhythm that grows from compact mobile spacing to broad editorial intervals on desktop.

Storefront page families share a clear spatial grammar. Discovery pages use oversized route heroes, a compact control bar, and two- or three-column product fields. Decision pages use an asymmetric optical-media and dark-console split. Operate pages use a single task flow with a sticky summary at desktop widths. Learn pages pair an index or optical rail with a constrained reading column.

At 48rem, grids, support links, reader rails, and editorial cards begin to form columns. At 64rem, product, checkout, cart, account, and specification views become asymmetric split layouts. Below 48rem, the system collapses to one editorial spine: product media precedes facts, summaries become inline, primary actions span the available width, and ornamental optical geometry moves behind or below copy rather than clipping it. Logical properties preserve reading order and alignment in RTL layouts.

**The Asymmetric Split Rule.** Pair one dominant visual or task field with one narrower decision field; avoid evenly weighted dashboard grids when the page has a clear primary action.

**The Rectangular Information Rule.** Product imagery may occupy lens silhouettes, but specifications, legal copy, forms, and transactional content stay rectangular and scannable.

## Elevation & Depth

The system is flat by default. Thin rules, tonal shifts, and hard dark-to-light transitions establish most hierarchy. Diffuse shadows appear only where an optical object needs physical depth or where a dark summary/control surface must float above a workflow; inset highlights make lenses feel coated rather than card-like.

**The Optical-Only Lift Rule.** Reserve visible depth for lens media, sticky summaries, dropdowns, and active controls. Editorial content and ordinary containers remain ruled or tonally separated.

## Shapes

Irregular optical masks are the signature silhouette. They use horizontally stretched, gently asymmetric radii that evoke sport lenses and frame rims; imagery can be clipped or inset within them, often with a dark structural border. Circles mark directional actions, numbered stages, and compact hardware-like controls.

Functional controls use gently curved corners, while contained task summaries use a slightly broader panel radius. Information groups, tables, support links, and reading sections prefer square edges and thin rules. The contrast between organic optical media and disciplined rectangular information is essential to the system.

**The Lens Is Not a Card Rule.** Use an optical silhouette only when it carries imagery, product hardware, or spatial atmosphere. Never turn every content container into a lens.

## Components

### Buttons

- **Shape:** Gently curved controls with a minimum touch height; circular arrow controls are reserved for compact directional actions.
- **Primary:** Chartreuse fill with optical-ink text, strong weight, and the established compact horizontal padding.
- **Hover / Focus:** Primary fill brightens slightly; active state compresses subtly. Keyboard focus uses a three-pixel chartreuse outline with visible offset.
- **Secondary:** Transparent with a one-pixel current-color border; it inverts to an ink field with paper text on light backgrounds.

### Product Cards

- **Character:** Product-first editorial tiles with the image isolated inside an irregular lens field and facts organized below it.
- **Media:** Pale blue optical background, subtle inset edge, contained product photography, and a restrained reflective sweep on hover.
- **Information:** Product name, supporting line, price rail, and purchase action remain outside the mask in rectangular space.
- **Motion:** Image scale and reflection use smooth ease-out movement; both stop when reduced motion is requested.

### Inputs / Fields

- **Style:** White fields with a one-pixel cool-gray stroke, gently curved corners, and dark legible text.
- **Focus:** Border shifts darker and receives a chartreuse translucent ring in addition to the global keyboard-visible outline.
- **Grouping:** Search and filter controls may sit inside one dark equipment-like tray; checkout fields stay on a calm light workflow surface.

### Navigation

- **Style:** A persistent matte-black announcement and navigation stack across the storefront, with white text and chartreuse hover/state accents.
- **Desktop:** Compact centered routes with language, currency, search, and cart aligned as global utilities.
- **Mobile:** A compact dark header opens a full-width dark menu. RTL mirrors menu placement and directional icons while preserving control order.

### Summary Panels

- **Style:** Dark contained consoles for checkout totals, cart totals, account actions, and configuration decisions.
- **Shape:** Slightly rounded panel edge with strong white type, muted silver support copy, and thin translucent dividers.
- **Behavior:** Sticky on wide layouts when it helps comparison; inline in the mobile reading flow.

### Data Rails

- **Style:** Thin border-separated rows or columns for specifications, feature facts, checkout stages, support choices, and comparisons.
- **Behavior:** Dense tables scroll horizontally at tablet widths; mobile stages become a vertical numbered sequence.

## Do's and Don'ts

### Do:

- **Do** use optical black, daylight paper, and lens cyan to establish structure before introducing chartreuse.
- **Do** keep verified product names, prices, specifications, shipping, and purchase paths visually direct.
- **Do** use thin rules, numbering, and asymmetric splits to organize dense commerce tasks.
- **Do** keep optical masks around imagery and product hardware while placing essential information on readable rectangular fields.
- **Do** recompose layouts for mobile and RTL, maintain visible focus, and provide static reduced-motion states.

### Don't:

- **Don't** repeat the homepage Lens Tunnel verbatim on interior routes; inherit its materials and geometry instead.
- **Don't** scatter chartreuse across multiple competing calls to action in the same viewport.
- **Don't** default to generic rounded-card grids, floating glass panels, decorative gradients, or generic technology glow.
- **Don't** place essential facts inside masked imagery or rely on animation to reveal them.
- **Don't** treat generated lifestyle scenes as evidence for unverified product capabilities.
