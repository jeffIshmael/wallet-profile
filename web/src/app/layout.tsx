import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileAppShell } from "@/components/layout/MobileAppShell";
import { AppToaster } from "@/components/ui/AppToaster";
import { AppAuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Chainalyse AI",
  description: "Onchain reputation and financial health dashboard for Celo and MiniPay users"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#030304"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Playwrite+GB+S+Guides:ital@0;1&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <style>{`:root { --font-fraunces: "Fraunces"; --font-jakarta: "Plus Jakarta Sans"; --font-jetbrains: "JetBrains Mono"; --font-cabinet: "Cabinet Grotesk"; --font-outfit: "Outfit"; --font-plex-mono: "IBM Plex Mono"; --font-syne: "Syne"; --font-dm-mono: "DM Mono"; --font-space: "Space Grotesk"; --font-inter: "Inter"; --font-dancing: "Dancing Script"; --font-playwrite: "Playwrite GB S Guides"; --font-roboto: "Roboto"; }`}</style>
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AppAuthProvider>
            <MobileAppShell>{children}</MobileAppShell>
          </AppAuthProvider>
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
