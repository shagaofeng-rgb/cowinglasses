# Bright split-layout visual QA

**Comparison target**

- Source visual truth: `/Users/apple/.codex/generated_images/01a01e91-e23f-7cb0-a51e-88b35dcf0852/exec-1a66c227-0067-46b4-b4dd-f3f2fe5d730a.png`.
- Implementation: `http://localhost:3028/en`.
- Implementation capture: `output/design-qa/bright-split-final-1280x720.jpg`.
- Full comparison evidence: `output/design-qa/bright-split-reference-and-implementation.jpg`.
- Viewport and state: desktop homepage initial state, 1280 × 720 CSS px at 1× implementation density. The supplied 1487 × 1058 reference is taller; comparison review uses its above-the-fold composition.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Intentional product-content deviation: all product labels, prices and feature copy come from the storefront's clearly marked demo data; unconfirmed specifications from the reference were not copied.
- Intentional navigation deviation: Support remains in the main navigation because it is a required storefront route.

**Required fidelity surfaces**

- Fonts and typography: the bright page uses the reference's oversized light display headline, compact uppercase labels and restrained navigation hierarchy.
- Spacing and layout rhythm: the 43/57 split, full-height cycling image, clear ruled product rows, isolated product media and end-aligned lime actions preserve the reference composition.
- Colors and visual tokens: the black utility strip, warm off-white canvas, thin gray dividers and single lime accent match the selected direction.
- Image quality and asset fidelity: the cycling panel is a dedicated, original campaign asset; product selections use real raster product photography rather than drawn substitutes.
- Copy and content: product decisions remain legible, clearly labelled as demo data, and keep the required localized pricing and route actions.

**Interaction checks**

- The first product choice opens `/en/products/cw-flow-demo`.
- Language, currency, cart, shop and support routes remain available through the shared header.
- Product selection and cart interactions were retained from the prior verified build.

**Follow-up polish**

- P3: replace demo product photography and campaign image with final licensed CoWin assets when supplied.

**Implementation checklist**

- [x] Restore the selected bright split-layout content and hierarchy.
- [x] Apply the matching light editorial design system across shared components and routes.
- [x] Build and render the primary page in the local browser.

final result: passed
