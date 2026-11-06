import type { Metadata } from "next";
import { Barlow_Condensed, Manrope } from "next/font/google";
import "@/app/globals.css";
import { siteConfig } from "@/config/site";

const displayFont = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metaPixelCode = `(function(){function start(){try{if(localStorage.getItem('cowin-analytics-consent')!=='granted'||window.fbq)return;}catch(e){return;}
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '955166104308526');
fbq('track', 'PageView');}start();window.addEventListener('cowin-analytics-consent-change',start);})();`;

export const siteDocumentMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
};
export function SiteDocument({ children, lang, dir = "ltr" }: Readonly<{
  children: React.ReactNode; lang: string; dir?: "ltr" | "rtl";
}>) {
  return (
    <html lang={lang} dir={dir} data-scroll-behavior="smooth">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
