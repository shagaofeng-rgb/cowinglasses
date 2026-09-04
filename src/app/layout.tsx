import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { ConsentAwareMetaPixel } from "@/components/analytics/meta-pixel";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script id="document-locale" strategy="beforeInteractive">
          {`(function(){var l=location.pathname.split('/')[1];if(!/^(en|ar|es|pt|ja|ko)$/.test(l))l='en';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';})();`}
        </Script>
      </head>
      <body>
        <ConsentAwareMetaPixel />
        {children}
      </body>
    </html>
  );
}
