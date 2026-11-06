import type { quoteStatus } from "@/db/schema";

export const quoteStatuses: Record<(typeof quoteStatus.enumValues)[number], string> = {
  new: "待处理", in_review: "跟进中", quoted: "已记录报价", closed: "已关闭",
};

export const quotePurposes: Record<string, string> = { personal: "个人使用", team: "团队 / 企业", resale: "经销 / 转售" };
