import { NextResponse, type NextRequest } from "next/server";

import { isLocale } from "@/lib/i18n";
import { isProductSection } from "@/components/product/product-sections";
import { missingDocument } from "@/lib/seo/missing-document";
import { storefrontRoutePaths } from "@/lib/seo/sitemap-config";

const nonStorefrontRoots = new Set(["admin", "api", "_next", "images", ".well-known"]);
const restrictedStorefrontCountries = new Set(["CN", "IN"]);

function unavailableInRegion() {
  return new NextResponse("This storefront is not available in your region.", {
    status: 451,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

/** Allows Oceanpayment's 3DS POST return to use the exact checkout URL required by its SDK. */
export function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  const [first = "", second = "", , section = ""] = parts;
  const locale = isLocale(first) ? first : null;
  const isStorefront = !first || locale !== null;
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();

  // Vercel supplies the country header at the edge. Scope this only to the
  // public storefront so administrators, webhooks, and payment callbacks are
  // never blocked by a shopper-facing regional policy.
  if (request.method !== "POST" && isStorefront && country && restrictedStorefrontCountries.has(country)) return unavailableInRegion();

  if (request.method === "GET" || request.method === "HEAD") {
    if (locale && parts.length > 1) {
      const dynamic = second === "products"
        ? parts.length === 3 || (parts.length === 4 && isProductSection(section))
        : (second === "news" || second === "blog") && parts.length === 3;
      if (!dynamic && !storefrontRoutePaths.has(parts.slice(1).join("/"))) return missingDocument(locale, request.method === "HEAD");
    } else if (!locale && first && !nonStorefrontRoots.has(first) && !first.includes(".") && parts.join("/") !== "news/rss.xml") {
      return missingDocument("en", request.method === "HEAD");
    }
  }

  if (request.method !== "POST" || parts.length !== 2 || !locale || !["checkout", "payment-test"].includes(parts[1])) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/api/payments/oceanpayment/return";
  url.searchParams.set("__cowin_locale", parts[0]);
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/", "/:locale/:path*"] };
