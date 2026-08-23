"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { productReviews } from "@/db/schema";
import { writeAuditLog } from "@/lib/admin/audit";
import { requirePermission } from "@/lib/admin/auth";

export type ReviewState = { success: boolean; message: string };
export const initialReviewState: ReviewState = { success: false, message: "" };
const reviewSchema = z.object({ id: z.string().uuid().optional(), status: z.enum(["pending", "published", "hidden"]), adminReply: z.string().trim().max(4000).optional() });

export async function updateReviewAction(_state: ReviewState, formData: FormData): Promise<ReviewState> {
  const actor = await requirePermission("catalog.review");
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.id) return { success: false, message: "评价参数无效。" };
  try {
    await getDatabase().update(productReviews).set({ status: parsed.data.status, adminReply: parsed.data.adminReply || null, updatedAt: new Date() }).where(eq(productReviews.id, parsed.data.id));
    await writeAuditLog({ actorId: actor.id, action: "catalog.review.update", resourceType: "product_review", resourceId: parsed.data.id, result: "success" });
    revalidatePath("/admin/reviews");
    return { success: true, message: "评价状态已更新。" };
  } catch (error) {
    console.error("review-update", error);
    await writeAuditLog({ actorId: actor.id, action: "catalog.review.update", resourceType: "product_review", resourceId: parsed.data.id, result: "failure" });
    return { success: false, message: "保存失败，请稍后重试。" };
  }
}
