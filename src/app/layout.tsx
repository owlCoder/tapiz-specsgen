import type { Metadata } from "next";
import "@tapizlabs/ui/fonts";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppToastProvider } from "@/components/layout/AppToastProvider";
import { HTML_LANGS } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { I18nProvider } from "@/i18n/I18nProvider";
import appConfig from "@/app.config";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDict();
  return {
    title: appConfig.name,
    description: dict.meta.description,
  };
}

const themeInitScript = `try{var t=localStorage.getItem("tb-theme");document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = await getDict();
  return (
    <html
      lang={HTML_LANGS[locale]}
      className="dark h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} dict={dict}>
          <ThemeProvider>
            <AppToastProvider>{children}</AppToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
