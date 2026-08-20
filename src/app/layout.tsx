import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { metadataBase: new URL(siteConfig.url), title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` }, description: siteConfig.description };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html><body>{children}</body></html>; }
