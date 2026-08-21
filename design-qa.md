# Homepage design QA

## Comparison target

- **Source visual truth:** `D:\codex\.codex\generated_images\01a01f27-70aa-7511-aa8b-0626c060c6c1\exec-575a0a61-71df-4583-ae1f-f7ae8ff67d05.png`
- **Implementation screenshot:** `C:\Users\Administrator\Documents\ChatGPT\智能眼镜\_cowinglasses_repo\homepage-qa-implementation.png`
- **Combined full-view evidence:** `C:\Users\Administrator\Documents\ChatGPT\智能眼镜\_cowinglasses_repo\homepage-qa-comparison.png`
- **Desktop viewport / density:** 1536 × 1024 CSS px / 1×; source 1536 × 1024 px and implementation 1536 × 1024 px. No density scaling was applied before visual comparison.
- **State:** English homepage (`/en`), initial scroll position, no hover or menu state active.
- **Mobile check:** 390 × 844 CSS px / 1×. The hero stacks correctly, navigation collapses to the supplied mobile menu control, CTAs stay visible, and there was no overflow.
- **Runtime evidence:** Browser console check returned no warnings or errors.

## Findings

### Iteration 1

- [P1] The initial implementation used a full viewport-height hero and a three-line headline. The source direction presents the full hero and the beginning of the editorial-picks rail in the same desktop view.
  - **Location:** `src/components/home/home-page.tsx`, hero section.
  - **Evidence:** Initial desktop capture showed no editorial-picks region at 1536 × 1024, while the source presents the heading, product rail, and category navigation in the reference composition.
  - **Impact:** The page read more like a campaign landing screen than the selected editorial storefront direction.
  - **Fix applied:** Reduced desktop hero height to 540px, changed the headline to the reference's two-line cadence, and removed the restrictive headline width.

### Post-fix comparison

- No actionable P0, P1, or P2 differences remain.
- **Typography:** The implementation uses the existing Bodoni display face and Manrope UI font, preserving the reference's editorial serif/sans hierarchy. The selected headline wraps to the same two-line cadence at the comparison viewport.
- **Spacing and layout rhythm:** The hero uses the same asymmetric editorial split, with the real G200 product image in a broad white panel. The editorial-picks header and four-column rail begin in the initial desktop view, matching the source's browsing rhythm.
- **Colors and tokens:** Existing ivory paper, white image surface, black typography, fine dividers, and lime CTA token align with the selected direction while remaining consistent with the live product pages.
- **Image quality and asset fidelity:** The reference's generated black glasses were intentionally replaced with the already-live G200 product image at the user's request. No placeholder or recreated product art is used; every product image comes from the existing supplied assets.
- **Copy and content:** Headline, product labels, current USD price data, live product counts, and purchase routes are coherent with the already-published catalogue.
- **Focused region comparison:** The hero, primary CTA, product image panel, editorial-picks heading, and start of the four-column product rail were all visible and readable in the combined comparison. A separate focused crop was not needed.

## Open questions

- The reference uses custom category icons. This implementation keeps the lower category area tied to the real product collection rather than introducing new decorative assets; it is an intentional adaptation, not a functional or fidelity blocker.

## Implementation checklist

- [x] Replace demo/lifestyle homepage content with live products only.
- [x] Use the real G200 asset as the hero product.
- [x] Surface real models, USD prices, and product links in the editorial rail.
- [x] Preserve working Shop and product-page CTAs.
- [x] Check desktop and mobile layouts plus browser console health.

## Follow-up polish

- [P3] Add custom category icon assets only if a later brand asset pack is provided.

final result: passed
