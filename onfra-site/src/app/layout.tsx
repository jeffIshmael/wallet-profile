import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "OnFRA — Crypto Income Insights, Wallet Statements & Financial Reports",
  description:
    "Understand your crypto income and wallet activity. OnFRA turns supported onchain transactions into clear statements, financial reports and financial insights.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://onfra.xyz"),
  openGraph: {
    title: "Make your crypto income count.",
    description:
      "Turn wallet activity into transaction statements, income insights and financial reports you can understand and share.",
    siteName: "OnFRA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Make your crypto income count.",
    description:
      "Turn wallet activity into transaction statements, income insights and financial reports you can understand and share.",
  },
  other: {
    "agent-card": "/.well-known/agent-card.json",
    "mcp-manifest": "/.well-known/mcp.json"
  }
};

const themeBootScript = `
(function(){
  var r = document.documentElement;
  r.setAttribute("data-theme", "light");
  r.classList.remove("dark");
  r.classList.add("light");
  r.style.setProperty("--color-purple", "#7c3aed");
  r.style.setProperty("--color-purple-dark", "#6d28d9");
  r.style.setProperty("--color-purple-soft", "#ede9fe");
  r.style.setProperty("--accent-glow", "124, 58, 237");
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="font-sans antialiased bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900">
        <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
