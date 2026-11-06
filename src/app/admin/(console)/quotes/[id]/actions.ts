"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { adminUsers, auditLogs, quoteRequests, quoteStatus } from "@/db/schema";
import { requirePermission } from "@/lib/admin/auth";

const editSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(quoteStatus.enumValues),
  assignedTo: z.union([z.literal(""), z.string().uuid()]),
  quoteAmountUsd: z.string().trim().regex(/^(?:\d{1,10}(?:\.\d{1,2})?)?$/),
  followUpNote: z.string().trim().max(2000),
});

export async function updateQuote(_previous: string, formData: FormData) {
  const actor = await requirePermission("customers.update");
  const parsed = editSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return "请检查状态、负责人、报价和跟进记录。";
  const { id, status, assignedTo, quoteAmountUsd, followUpNote } = parsed.data;
  if (status === "quoted" && !(Number(quoteAmountUsd) > 0)) return "记录报价时请填写有效的美元金额。";
  try {
    const result = await getDatabase().transaction(async (tx) => {
      if (assignedTo) {
        const [assignee] = await tx.select({ id: adminUsers.id }).from(adminUsers)
          .where(and(eq(adminUsers.id, assignedTo), eq(adminUsers.status, "active")));
        if (!assignee) return "此负责人当前无法接收询价。";
      }
      const [saved] = await tx.update(quoteRequests).set({
        status, assignedTo: assignedTo || null, quoteAmountUsd: quoteAmountUsd || null, followUpNote, updatedAt: new Date(),
      }).where(eq(quoteRequests.id, id)).returning({ id: quoteRequests.id });
      if (!saved) return "找不到该询价。";
      await tx.insert(auditLogs).values({
        actorId: actor.id, action: "quotes.update", resourceType: "quote", resourceId: id, result: "success",
        metadata: { status, assignedTo: assignedTo || null },
      });
      return null;
    });
    if (result) return result;
    updateTag("admin-operating-data");
    revalidatePath("/admin/quotes");
    revalidatePath(`/admin/quotes/${id}`);
    return "询价记录已更新。";
  } catch {
    return "保存失败，请重试。";
  }
}
