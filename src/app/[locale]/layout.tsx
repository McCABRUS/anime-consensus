import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter, Space_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import Script from "next/script";

import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const rtlLocales = new Set(["ar", "he"]);

export const metadata: Metadata = {
  title: "Anime Consensus",
  description:
    "Compare anime ratings from multiple platforms and discover the consensus score.",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = rtlLocales.has(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction}>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-WRJRMFP2');
  `}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-WRJRMFP2"
              height="0"
              width="0"
              style={{
                display: "none",
                visibility: "hidden",
              }}
            />
          </noscript>
        </Script>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
