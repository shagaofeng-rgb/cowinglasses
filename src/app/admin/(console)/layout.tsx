import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { isDatabaseConfigured } from "@/db/client";
import { requireAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  if (!isDatabaseConfigured() || !process.env.AUTH_SECRET) redirect("/admin/login?setup=1");
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
