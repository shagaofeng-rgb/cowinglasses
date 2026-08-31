import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDatabase } from "@/db/client";
import { customerAccounts, customerSessions, customers } from "@/db/schema";

export const customerSessionCookie = "cowin_customer_session";
export const customerSessionDays = 30;

export function hashCustomerSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createCustomerSessionMaterial() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + customerSessionDays * 24 * 60 * 60 * 1000,
  );
  return { token, tokenHash: hashCustomerSessionToken(token), expiresAt };
}

export function setCustomerSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
) {
  response.cookies.set(customerSessionCookie, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearCustomerSessionCookie(response: NextResponse) {
  response.cookies.set(customerSessionCookie, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getCustomerSession() {
  const token = (await cookies()).get(customerSessionCookie)?.value;
  if (!token) return null;
  const db = getDatabase();
  const row = (
    await db
      .select({
        customerId: customers.id,
        email: customers.email,
        firstName: customers.firstName,
        lastName: customers.lastName,
        phone: customers.phone,
        accountCreatedAt: customerAccounts.createdAt,
        sessionId: customerSessions.id,
      })
      .from(customerSessions)
      .innerJoin(customers, eq(customerSessions.customerId, customers.id))
      .innerJoin(
        customerAccounts,
        eq(customerAccounts.customerId, customers.id),
      )
      .where(
        and(
          eq(
            customerSessions.sessionTokenHash,
            hashCustomerSessionToken(token),
          ),
          gt(customerSessions.expiresAt, new Date()),
          eq(customerAccounts.status, "active"),
        ),
      )
      .limit(1)
  )[0];
  return row ?? null;
}
