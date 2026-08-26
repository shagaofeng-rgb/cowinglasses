import { NextRequest, NextResponse } from "next/server";
import { parseOceanpaymentNotification, verifyOceanpaymentNotification } from "@/lib/commerce/oceanpayment";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("__cowin_locale") || "en";
  const notification = parseOceanpaymentNotification(await request.text());
  const result = notification && verifyOceanpaymentNotification(notification) ? "processing" : "invalid";
  const destination = new URL(`/${locale}/checkout`, request.url);
  destination.searchParams.set("payment_return", result);
  if (notification?.order_number) destination.searchParams.set("order", notification.order_number);
  return NextResponse.redirect(destination, 303);
}
