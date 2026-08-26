import { NextResponse, type NextRequest } from "next/server";

const locales = new Set(["en", "ar", "es", "pt", "ja", "ko"]);

/** Allows Oceanpayment's 3DS POST return to use the exact checkout URL required by its SDK. */
export function proxy(request: NextRequest) {
  if (request.method !== "POST") return NextResponse.next();
  const parts = request.nextUrl.pathname.split("/").filter(Boolean);
  if (parts.length !== 2 || !locales.has(parts[0]) || !["checkout", "payment-test"].includes(parts[1])) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/api/payments/oceanpayment/return";
  url.searchParams.set("__cowin_locale", parts[0]);
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/:locale/checkout", "/:locale/payment-test"] };
