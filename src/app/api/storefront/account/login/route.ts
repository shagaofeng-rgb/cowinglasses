import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { customerAccounts, customerSessions, customers } from "@/db/schema";
import { createCustomerSessionMaterial, setCustomerSessionCookie } from "@/lib/customer/auth";

export const runtime = "nodejs";
const inputSchema = z.object({ email: z.string().trim().toLowerCase().email().max(320), password: z.string().min(10).max(128) });

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ success: false, error: { code: "DATABASE_UNAVAILABLE" } }, { status: 503 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: "INVALID_CREDENTIALS" } }, { status: 400 });
  const db = getDatabase();
  const row = (await db.select({ customer: customers, account: customerAccounts }).from(customers).innerJoin(customerAccounts, eq(customerAccounts.customerId, customers.id)).where(eq(customers.email, parsed.data.email)).limit(1))[0];
  const now = new Date();
  if (!row || row.account.status !== "active" || (row.account.lockedUntil && row.account.lockedUntil > now)) {
    return NextResponse.json({ success: false, error: { code: row?.account.lockedUntil ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS" } }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const valid = await bcrypt.compare(parsed.data.password, row.account.passwordHash);
  if (!valid) {
    const attempts = row.account.failedLoginAttempts + 1;
    await db.update(customerAccounts).set({ failedLoginAttempts: attempts >= 5 ? 0 : attempts, lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null, updatedAt: now }).where(eq(customerAccounts.id, row.account.id));
    return NextResponse.json({ success: false, error: { code: attempts >= 5 ? "ACCOUNT_LOCKED" : "INVALID_CREDENTIALS" } }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const session = createCustomerSessionMaterial();
  await db.transaction(async (tx) => {
    await tx.update(customerAccounts).set({ failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: now, updatedAt: now }).where(eq(customerAccounts.id, row.account.id));
    await tx.delete(customerSessions).where(eq(customerSessions.customerId, row.customer.id));
    await tx.insert(customerSessions).values({ customerId: row.customer.id, sessionTokenHash: session.tokenHash, expiresAt: session.expiresAt });
  });
  const response = NextResponse.json({ success: true, data: { email: row.customer.email, firstName: row.customer.firstName } }, { headers: { "Cache-Control": "no-store" } });
  setCustomerSessionCookie(response, session.token, session.expiresAt);
  return response;
}
