import type { Metadata } from "next";
import { SiteDocument } from "@/components/layout/site-document";

export const metadata: Metadata = { title: "CoWin Glasses 管理后台", robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="zh-CN">{children}</SiteDocument>;
}
