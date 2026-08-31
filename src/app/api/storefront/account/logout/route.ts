import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { customerSessions } from "@/db/schema";
import { clearCustomerSessionCookie, customerSessionCookie, hashCustomerSessionToken } from "@/lib/customer/auth";

export async function POST() {
  const token = (await cookies()).get(customerSessionCookie)?.value;
  if (token && isDatabaseConfigured()) await getDatabase().delete(customerSessions).where(eq(customerSessions.sessionTokenHash, hashCustomerSessionToken(token)));
  const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  clearCustomerSessionCookie(response);
  return response;
}
