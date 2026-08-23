import { NextResponse } from "next/server";
import { z } from "zod";
import { getDatabase } from "@/db/client";
import { storefrontEvents } from "@/db/schema";

const supportSchema = z.object({
  kind: z.enum(["support", "warranty", "newsletter"]),
  name: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(320).optional(),
  orderNumber: z.string().trim().max(96).optional(),
  productModel: z.string().trim().max(240).optional(),
  message: z.string().trim().max(5000).optional(),
  mediaUrl: z.string().trim().url().max(2000).optional().or(z.literal("")),
}).superRefine((value, context) => {
  if (value.kind === "newsletter" && !value.email) context.addIssue({ code: "custom", message: "请填写邮箱。" });
  if (value.kind === "support" && (!value.name || !value.email || !value.message)) context.addIssue({ code: "custom", message: "请填写姓名、邮箱和问题描述。" });
  if (value.kind === "warranty" && (!value.orderNumber || !value.productModel || !value.message)) context.addIssue({ code: "custom", message: "请补全售后申请信息。" });
});

export async function POST(request: Request) {
  try {
    const payload = supportSchema.parse(await request.json());
    await getDatabase().insert(storefrontEvents).values({
      eventName: "support_form",
      eventId: crypto.randomUUID(),
      path: "/support",
      source: "storefront",
      metadata: { ...payload, mediaUrl: payload.mediaUrl || undefined },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message ?? "提交内容无效。" }, { status: 400 });
    console.error("support-form-submit", error);
    return NextResponse.json({ error: "暂时无法提交，请稍后再试。" }, { status: 500 });
  }
}
