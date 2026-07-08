import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { DEFAULT_THEME_ID, THEME_BOOT_MAP, THEME_STORAGE_KEY } from "@/lib/nudeThemes";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "OnFRA — Onchain Financial Reputation Agent",
  description:
    "Financial reputation infrastructure for Celo. Lenders and agents screen wallets, verify income, and assess loan capacity via API.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001")
};

const themeBootScript = `
(function(){
  var themes = ${JSON.stringify(THEME_BOOT_MAP)};
  var id = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) || ${JSON.stringify(DEFAULT_THEME_ID)};
  var t = themes[id] || themes[${JSON.stringify(DEFAULT_THEME_ID)}];
  var r = document.documentElement;
  r.setAttribute("data-theme", id);
  r.style.setProperty("--color-nude", t.nude);
  r.style.setProperty("--color-nude-soft", t.soft);
  r.style.setProperty("--color-nude-dark", t.dark);
  r.style.setProperty("--color-nude-muted", t.muted);
  r.style.setProperty("--accent-glow", t.glow);
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <ThemeSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
