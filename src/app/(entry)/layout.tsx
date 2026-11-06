import { SiteDocument } from "@/components/layout/site-document";

export default function EntryLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument lang="en">{children}</SiteDocument>;
}
