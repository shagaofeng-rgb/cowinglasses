import { NextResponse, type NextRequest } from "next/server";

const locales = new Set(["en", "ar", "es", "pt", "ja", "ko"]);
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
  const isStorefront = parts.length === 0 || locales.has(parts[0] ?? "");
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();

  // Vercel supplies the country header at the edge. Scope this only to the
  // public storefront so administrators, webhooks, and payment callbacks are
  // never blocked by a shopper-facing regional policy.
  if (request.method !== "POST" && isStorefront && country && restrictedStorefrontCountries.has(country)) return unavailableInRegion();

  if (request.method !== "POST" || parts.length !== 2 || !locales.has(parts[0]) || !["checkout", "payment-test"].includes(parts[1])) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/api/payments/oceanpayment/return";
  url.searchParams.set("__cowin_locale", parts[0]);
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/", "/:locale/:path*"] };
