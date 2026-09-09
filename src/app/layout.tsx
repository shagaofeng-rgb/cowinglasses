import type { Metadata } from "next";
import Script from "next/script";
import { Barlow_Condensed, Manrope } from "next/font/google";
import "./globals.css";
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

const metaPixelCode = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '955166104308526');
fbq('track', 'PageView');`;

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
        <script dangerouslySetInnerHTML={{ __html: metaPixelCode }} />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=955166104308526&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
