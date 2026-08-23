import "server-only";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { auditLogs } from "@/db/schema";

export async function writeAuditLog(input: { actorId?: string; action: string; resourceType: string; resourceId?: string; result: "success" | "failure" | "denied"; requestId?: string; sourceIp?: string; userAgent?: string; metadata?: Record<string, unknown> }) {
  if (!isDatabaseConfigured()) return;
  try {
    await getDatabase().insert(auditLogs).values({ actorId: input.actorId, action: input.action, resourceType: input.resourceType, resourceId: input.resourceId, result: input.result, requestId: input.requestId, sourceIp: input.sourceIp, userAgent: input.userAgent, metadata: input.metadata ?? {} });
  } catch (error) {
    // 审计失败不能中断已完成的业务动作；调用方仍保留安全的服务端错误日志。
    console.error("后台审计日志写入失败", error);
  }
}
