import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroWalletInput } from "@/components/HeroWalletInput";
import { FaqAccordion } from "@/components/FaqAccordion";
import { RotatingWord, CountUp } from "@/components/AnimatedBits";
import { LINKS } from "@/lib/links";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Bot,
  PieChart,
  Layers,
  Sparkles,
  Download,
  Check,
  User,
  Building2
} from "lucide-react";

/* ----------------------------------------------------------------
   Dummy stats: replace the numbers with real ones when you have them.
---------------------------------------------------------------- */
const STATS = [
  { value: 12480, prefix: "", suffix: "+", decimals: 0, label: "Wallets analyzed" },
  { value: 5200, prefix: "", suffix: "+", decimals: 0, label: "Exported transaction statements" },
  { value: 8900, prefix: "", suffix: "+", decimals: 0, label: "Reports generated" },
  { value: 1, prefix: "", suffix: "", decimals: 0, label: "Networks supported" }
];

export default function HomePage() {
  return (
    <div className="page-shell bg-white text-[#111017]">
      <SiteNav />

      <main>
        {/* ========================================================
            SECTION 1: HERO (look unchanged; only the copy is new,
            and the first word now rotates)
        ======================================================== */}
        <section className="hero-pitch-purple relative overflow-hidden pt-28 pb-32 sm:pt-32 sm:pb-36 md:pt-36">
          {/* Nordic knit pattern */}
          <div className="nordic-pattern" />

          {/* Cool ambient light */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-48 h-96 w-96 rounded-full bg-[#b7aedb]/25 blur-3xl" />

          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 text-center">
            {/* Trust tag + onchain tag */}
            <div className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 p-1 pr-4 text-xs font-semibold text-[#4a4655] shadow-lg backdrop-blur-md">
              <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 font-bold text-[#111017]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#564870]" />
                Trusted
              </span>
              <span className="pl-2 font-bold">Onchain financial clarity</span>
            </div>

            {/* Headline */}
            <h1 className="headline mt-7 text-5xl font-white tracking-tight text-[#111017] sm:text-7xl md:text-8xl">
              <RotatingWord /> your
              <br />
              <span className="headline-accent">onchain transactions.</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-snug text-[#4a4655] sm:text-2xl md:text-3xl">
              From{" "}
              <span className="underline decoration-[#f5b862] decoration-[3px] underline-offset-[7px]">raw transactions</span>{" "}
              to{" "}
              <span className="underline decoration-[#f5b862] decoration-[3px] underline-offset-[7px]">financial clarity</span>.
            </p>

            {/* What you get */}
            <ul className="mx-auto mt-8 mb-4 grid max-w-xl gap-x-8 gap-y-3 text-left text-sm font-medium text-[#4a4655] sm:grid-cols-2">
              {[
                "Clear transaction statements",
                "Estimated income and inflows",
                "A financial health score",
                "Reports you can share and verify"
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#564870]/10 text-[#564870]">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Wallet address input */}
            <HeroWalletInput />

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#111017] px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#564870]/20 transition hover:bg-[#2a2733] active:scale-[0.98]"
              >
                <span>Launch OnFRA app</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </a>
              <a
                href="#how-it-works"
                className="btn-ghost flex items-center gap-2 px-7 py-3.5 text-sm font-semibold transition"
              >
                <span>See how it works</span>
              </a>
            </div>

            <p className="mt-5 text-xs font-medium text-[#4a4655]">
              Works with any public wallet on the Celo network. No signup needed.
            </p>

            {/* Dashboard screenshot */}
            <div className="relative mx-auto mt-14 w-full max-w-4xl">
              <div className="floating-chip anim-float -top-4 -left-4 hidden border border-white/70 bg-white/95 text-[#111017] sm:flex">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Est. Inflows: $4,850/mo</span>
              </div>

              <div className="floating-chip anim-float-delayed -top-4 -right-4 hidden border border-white/70 bg-white/95 text-[#111017] sm:flex">
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                <span>Health Score: 840 (Consistent)</span>
              </div>

              <div className="floating-chip anim-float -bottom-5 right-8 hidden border border-[#d4cee1] bg-[#f3f1f8] text-[#111017] sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-[#564870]" />
                <span>Verified REP Passport</span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/70 bg-white p-3 shadow-2xl shadow-[#564870]/20  sm:p-5">
                <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/90 px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="h-3 w-3 rounded-full bg-slate-300" />
                    <span className="ml-2 font-mono text-xs font-medium text-[#6f6b7a]">
                      app.onfra.xyz/dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[#ebe8f3] px-3 py-1 text-[11px] font-semibold text-[#564870]">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Celo network active</span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-b-2xl border border-slate-100 bg-white">
                  <img
                    src="/dashboard-preview.png"
                    alt="OnFRA Financial Statement Dashboard Overview"
                    className="w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 2: WHO IT'S FOR (use-case cards)
        ======================================================== */}
        <section id="use-cases" className="section-subtle py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="text-center">
              <p className="label-accent">Made For Every Wallet</p>
              <h2 className="headline mx-auto mt-3 max-w-2xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
                However you use your wallet, OnFRA reads it for you.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Individuals */}
              <div className="usecase-card flex flex-col bg-gradient-to-br from-[#e6e0f5] to-[#cfc6ea] p-5">
                <div className="usecase-visual flex items-end gap-2 px-5 pb-5 pt-8">
                  {[45, 70, 55, 85, 60, 95, 75, 100].map((h, i) => (
                    <span
                      key={i}
                      className="bar-anim flex-1 rounded-t-md bg-gradient-to-t from-[#564870] to-[#9d8fd0]"
                      style={{ height: `${h}%`, animationDelay: `${i * 0.25}s` }}
                    />
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#43385a]">
                  <User className="h-4 w-4" />
                  <span>For individuals</span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-[#111017]">See what you earn and spend</h3>
                <p className="mt-2 flex-1 text-xs leading-6 text-[#4a4655]">
                  Get a monthly picture of income, spending and savings, plus a statement you can hand to anyone.
                </p>
              </div>

              {/* Card 2: Businesses & DAOs */}
              <div className="usecase-card flex flex-col bg-gradient-to-br from-[#fdeccd] to-[#f8d5a3] p-5">
                <div className="usecase-visual flex flex-col justify-center gap-2.5 px-4">
                  {[
                    { n: "Client invoice", a: "+ $1,200", c: "text-emerald-600" },
                    { n: "Contractor payout", a: "− $480", c: "text-rose-600" },
                    { n: "Treasury swap", a: "− $2,000", c: "text-rose-600" }
                  ].map((r, i) => (
                    <div
                      key={r.n}
                      className="row-anim flex items-center justify-between rounded-xl bg-white px-3 py-2 text-[11px] font-semibold shadow-sm"
                      style={{ animationDelay: `${i * 0.7}s` }}
                    >
                      <span className="text-[#4a4655]">{r.n}</span>
                      <span className={r.c}>{r.a}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#8a5a12]">
                  <Building2 className="h-4 w-4" />
                  <span>For businesses and DAOs</span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-[#111017]">Keep treasury books clean</h3>
                <p className="mt-2 flex-1 text-xs leading-6 text-[#5a4a2c]">
                  Turn team and treasury wallets into categorized records and reports your accountant can read.
                </p>
              </div>

              {/* Card 3: AI agents */}
              <div className="usecase-card flex flex-col bg-gradient-to-br from-[#d6f3e8] to-[#aee3cf] p-5">
                <div className="usecase-visual bg-[#111017]/90 p-4 font-mono text-[11px] leading-5 text-emerald-300">
                  <p className="text-emerald-700/70">agent@onfra ~ %</p>
                  <p className="msg-anim">&gt; get_spending(&quot;0x4f…a9&quot;)</p>
                  <p className="msg-anim text-emerald-700/60" style={{ animationDelay: "0.9s" }}>
                    outflows: $1,920 · 31 txns
                  </p>
                  <p className="msg-anim text-emerald-700/60" style={{ animationDelay: "1.6s" }}>
                    paid via x402 · 0.01 USDT
                  </p>
                  <p>
                    &gt; <span className="cursor-blink inline-block h-3 w-1.5 bg-emerald-300 align-middle" />
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#17624a]">
                  <Bot className="h-4 w-4" />
                  <span>For AI agents</span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-[#111017]">Check how your agent spent</h3>
                <p className="mt-2 flex-1 text-xs leading-6 text-[#2f5546]">
                  Your agent can query its own spending, or any supported wallet, through APIs, MCP tools and x402.
                </p>
              </div>

              {/* Card 4: Lenders & verifiers */}
              <div className="usecase-card flex flex-col bg-gradient-to-br from-[#dbe9fb] to-[#b9d3f5] p-5">
                <div className="usecase-visual flex items-center justify-center">
                  <span className="ring-anim absolute h-16 w-16 rounded-full border-2 border-[#2f6fd0]" />
                  <span
                    className="ring-anim absolute h-16 w-16 rounded-full border-2 border-[#2f6fd0]"
                    style={{ animationDelay: "1.2s" }}
                  />
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#2f6fd0] text-white shadow-lg shadow-[#2f6fd0]/30">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#1d4a8f]">
                  <ShieldCheck className="h-4 w-4" />
                  <span>For reviewers and lenders</span>
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-[#111017]">Verify a report in seconds</h3>
                <p className="mt-2 flex-1 text-xs leading-6 text-[#2c4668]">
                  Verify any report is accurate and hasn't been tampered with.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 3: STATS (dummy numbers, edit STATS at the top)
        ======================================================== */}
        <section className="section-light border-t border-[#d4cee1]/70 py-16">
          <div className="mx-auto max-w-5xl px-5">
            <div className="grid grid-cols-2 gap-y-10 text-center md:grid-cols-4">
              {STATS.map((s, i) => (
                <div key={s.label} className="relative px-4">
                  {i > 0 && (
                    <span className="stat-divider absolute left-0 top-1/2 hidden h-14 w-px -translate-y-1/2 md:block" />
                  )}
                  <p className="headline text-4xl font-extrabold text-[#111017] sm:text-5xl">
                    <CountUp
                      to={s.value}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      decimals={s.decimals}
                    />
                  </p>
                  <p className="mt-2 text-xs font-medium text-[#5f5c67]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: THE PROBLEM
        ======================================================== */}
        <section className="section-subtle border-t border-[#d4cee1]/70 py-24">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">The Problem</p>
            <h2 className="headline mx-auto mt-3 max-w-xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
              Your wallet moves real money. You deserve to understand it.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#5f5c67] sm:text-base">
              More people earn, trade, and pay through crypto every day. But when money is spread across wallets, tokens, and networks, understanding your financial position becomes a headache.
            </p>

            <div className="mt-14 grid gap-6 text-left sm:grid-cols-3">
              <div className="card-lift p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-sm">
                  <PieChart className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111017]">Where did it all go?</h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  Transfers, gas fees, and token swaps make it nearly impossible to glance at your wallet and know your true monthly spending.
                </p>
              </div>

              <div className="card-lift p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-sm">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111017]">What did you actually earn?</h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  Separating recurring salary, freelance client invoices, and casual transfers from noise is painful without smart categorization.
                </p>
              </div>

              <div className="card-lift p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe8f3] text-[#564870] shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#111017]">Your records are hard to explain</h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  Lenders, landlords, and traditional finance don't read raw block explorers. You need clear, organized financial statements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 5: HOW IT WORKS
        ======================================================== */}
        <section id="how-it-works" className="section-light border-t border-[#d4cee1]/70 py-24">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">How It Works</p>
            <h2 className="headline mx-auto mt-3 max-w-xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
              From raw transactions to total financial clarity.
            </h2>

            <div className="mt-16 grid gap-8 text-left sm:grid-cols-3">
              <div className="rounded-3xl border border-[#d4cee1] bg-[#f3f1f8] p-7 transition hover:shadow-md">
                <span className="font-mono text-3xl font-extrabold text-[#564870]">01</span>
                <h3 className="mt-4 text-lg font-bold text-[#111017]">Add any wallet</h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  Connect your wallet or simply enter any public Celo wallet address. No password or signup required.
                </p>
              </div>

              <div className="rounded-3xl border border-[#d4cee1] bg-[#f3f1f8] p-7 transition hover:shadow-md">
                <span className="font-mono text-3xl font-extrabold text-[#564870]">02</span>
                <h3 className="mt-4 text-lg font-bold text-[#111017]">We analyze & organize</h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  OnFRA parses onchain transactions, categorizes inflows and outflows, and calculates income consistency metrics.
                </p>
              </div>

              <div className="rounded-3xl border border-[#d4cee1] bg-[#f3f1f8] p-7 transition hover:shadow-md">
                <span className="font-mono text-3xl font-extrabold text-[#564870]">03</span>
                <h3 className="mt-4 text-lg font-bold text-[#111017]">Understand & share</h3>
                <p className="mt-2 text-xs leading-6 text-[#5f5c67]">
                  View clean charts of your cashflow, export verified transaction statements, or generate onchain credit passports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 6: FEATURES
        ======================================================== */}
        <section id="features" className="section-subtle border-t border-[#d4cee1]/70 py-24">
          <div className="mx-auto max-w-5xl px-5 text-center">
            <p className="label-accent">What You Can Do</p>
            <h2 className="headline mx-auto mt-3 max-w-xl text-3xl font-extrabold text-[#111017] sm:text-4xl">
              More than a transaction list.
            </h2>

            <div className="mt-14 grid gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: TrendingUp,
                  title: "Understand your income",
                  body: "See estimated income patterns from the activity recorded across your supported wallet history."
                },
                {
                  icon: PieChart,
                  title: "Know where your money goes",
                  body: "Review outgoing transactions and understand how money moves from your wallet across periods."
                },
                {
                  icon: Download,
                  title: "Download your statement",
                  body: "Turn wallet activity into a clear, downloadable record with dates, transaction details and amounts.",
                  link: { label: "View a sample", href: LINKS.app, icon: FileSpreadsheet }
                },
                {
                  icon: ShieldCheck,
                  title: "Understand your financial health",
                  body: "Explore insights into income consistency, activity patterns and other key financial signals."
                },
                {
                  icon: Layers,
                  title: "Build a shareable profile",
                  body: "Bring your onchain financial activity together in a report you can keep, share, or verify onchain."
                },
                {
                  icon: Bot,
                  title: "Ask questions about your finances",
                  body: "Use the OnFRA conversational assistant to explore wallet activity and get explanations of your financial data.",
                  link: { label: "Try the OnFRA assistant", href: LINKS.app, icon: Sparkles }
                }
              ].map(({ icon: Icon, title, body, link }: any) => (
                <div key={title} className="card-lift p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ebe8f3] text-[#564870]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#111017]">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-[#5f5c67]">{body}</p>
                  {link && (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#ebe8f3] px-3.5 py-1.5 text-xs font-bold text-[#564870] transition hover:bg-[#dcd6ec] hover:text-[#43385a]"
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      <span>{link.label}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 7: SUPPORTED NETWORKS
        ======================================================== */}
        <section className="section-light border-t border-[#d4cee1]/70 py-20">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Supported Networks</p>
            <h2 className="headline mx-auto mt-3 max-w-lg text-2xl font-extrabold text-[#111017] sm:text-3xl">
              Your activity, where OnFRA supports it.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xs text-[#5f5c67] sm:text-sm">
              Start with wallets on the networks currently supported by OnFRA.
            </p>

            <div className="mx-auto mt-8 flex flex-wrap items-stretch justify-center gap-4">
              {/* Live: Celo */}
              <div className="relative flex min-w-[220px] flex-col items-center gap-3 rounded-3xl border border-[#d4cee1] bg-[#f3f1f8] px-10 py-6 shadow-sm">
                <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
                <img
                  src="/celo_logo.jpg"
                  alt="Celo Network"
                  className="h-12 w-auto object-contain sm:h-14"
                />
                <span className="text-sm font-bold text-[#111017]">Celo Mainnet</span>
                <p className="font-mono text-[11px] text-[#6f6b7a]">
                  Supports CELO, USDT, USDC, and cUSD transactions
                </p>
              </div>

              <span className="hidden items-center text-3xl font-light text-[#8f889e] sm:flex">+</span>

              {/* Coming soon: Base */}
              <div className="relative flex min-w-[180px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#c9c2dc] bg-white px-10 py-6">
                <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  Coming soon
                </span>
                 <img
                  src="/base_logo.webp"
                  alt="Base Network"
                  className="h-12 w-auto object-contain sm:h-14"
                />
                <span className="text-sm font-bold text-[#111017]">Base</span>
              </div>

              <span className="hidden items-center text-3xl font-light text-[#8f889e] sm:flex">+</span>

              {/* Coming soon: Arc */}
              <div className="relative flex min-w-[180px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-[#c9c2dc] bg-white px-10 py-6">
                <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                  Coming soon
                </span>
                 <img
                  src="/Arc_logo.jpg"
                  alt="Arc Network"
                  className="h-12 w-auto object-contain sm:h-14"
                />
                <span className="text-sm font-bold text-[#111017]">Arc</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 8: TRUST & VERIFICATION
        ======================================================== */}
        <section className="section-subtle border-t border-[#d4cee1]/70 py-20">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Transparent By Design</p>
            <h2 className="headline mx-auto mt-3 max-w-xl text-2xl font-extrabold text-[#111017] sm:text-3xl">
              Your reports should be easy to inspect.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5f5c67]">
              OnFRA uses onchain transaction data to build its reports. Where report verification is available, you can independently check the report's onchain proof.
            </p>

            <div className="mt-12 grid gap-6 text-left sm:grid-cols-3">
              <div className="rounded-2xl border border-[#d4cee1] bg-white p-6 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-[#564870]" />
                <h4 className="mt-4 text-sm font-bold text-[#111017]">Public Explorer Checks</h4>
                <p className="mt-2 text-xs leading-5 text-[#5f5c67]">
                  Every underlying transfer is traceable directly on Celo block explorers for verifiable authenticity.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4cee1] bg-white p-6 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-[#564870]" />
                <h4 className="mt-4 text-sm font-bold text-[#111017]">Onchain Proof Registry</h4>
                <p className="mt-2 text-xs leading-5 text-[#5f5c67]">
                  Generated reports carry an onchain attestation hash in OnchainReporter, verifiable by anyone without payment.
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4cee1] bg-white p-6 shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-[#564870]" />
                <h4 className="mt-4 text-sm font-bold text-[#111017]">Exact Data Periods</h4>
                <p className="mt-2 text-xs leading-5 text-[#5f5c67]">
                  Reports state the exact timeframe, transaction count, and active wallets evaluated.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 9: PRICING
        ======================================================== */}
        <section id="pricing" className="section-light border-t border-[#d4cee1]/70 py-24">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Simple Pricing</p>
            <h2 className="headline mx-auto mt-3 max-w-lg text-3xl font-extrabold text-[#111017] sm:text-4xl">
              Start free. Pay for deeper insight.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#5f5c67]">
              Explore your wallet activity first. Pay only when you need more detailed financial reports or advanced analysis.
            </p>

            <div className="mt-12 grid gap-8 text-left sm:grid-cols-2">
              {/* Free Tier */}
              <div className="rounded-3xl border border-[#d4cee1] bg-white p-8 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-[#5f5c67]">Explore for free</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#111017]">$0</span>
                  <span className="text-xs text-[#6f6b7a]">/ free in app</span>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#5f5c67]">
                  Connect your wallet or enter any public address to inspect overview metrics and basic activity.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-[#5f5c67]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Basic wallet analysis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Transaction activity overview</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Basic health indicator</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <a
                    href={LINKS.app}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#d4cee1] bg-white py-3.5 text-xs font-bold text-[#111017] shadow-sm transition hover:bg-[#f3f1f8] hover:border-[#b7aedb]"
                  >
                    <span>Analyze my wallet</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Paid Deeper Insight Tier */}
              <div className="relative rounded-3xl border-2 border-[#564870] bg-white p-8 shadow-xl shadow-[#564870]/15">
                <span className="absolute -top-3.5 right-6 rounded-full bg-[#564870] px-3.5 py-1 text-[10px] font-bold tracking-wide uppercase text-white shadow-sm">
                  Pay As You Go
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-[#43385a]">Pay for deeper insight</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#111017]">0.01 – 0.10</span>
                  <span className="text-xs font-medium text-[#6f6b7a]">USDT / query</span>
                </div>
                <p className="mt-3 text-xs leading-6 text-[#5f5c67]">
                  On-demand micropayments settled seamlessly over x402 on Celo. No subscriptions.
                </p>
                <ul className="mt-6 space-y-3 text-xs text-[#5f5c67]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#564870]" />
                    <span>Detailed financial reports & statements</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#564870]" />
                    <span>Verified onchain REP passports (0.10 USDT)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#564870]" />
                    <span>Free onchain report verification for lenders</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <Link
                    href={LINKS.pricing}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#564870] py-3.5 text-xs font-bold text-white shadow-md shadow-[#564870]/25 transition hover:bg-[#43385a]"
                  >
                    <span>View full pricing details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 10: FAQ
        ======================================================== */}
        <section id="faq" className="section-subtle border-t border-[#d4cee1]/70 py-24">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent">Questions, Answered</p>
            <h2 className="headline mx-auto mt-3 max-w-lg text-3xl font-extrabold text-[#111017] sm:text-4xl">
              A few things you should know.
            </h2>

            <FaqAccordion />
          </div>
        </section>

        {/* ========================================================
            SECTION 11: FINAL CTA
        ======================================================== */}
        {/* <section className="bottom-pitch-purple relative py-28 text-[#111017] sm:py-36">
          <div className="pointer-events-none absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-[#b7aedb]/25 blur-3xl" />

          <div className="nordic-pattern" />

          <div className="relative mx-auto max-w-4xl px-5 text-center">
            <h2 className="headline mx-auto max-w-2xl text-4xl font-black tracking-tight text-[#111017] sm:text-6xl md:text-7xl">
              Understand your
              <br />
              <span className="headline-accent">crypto money.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#4a4655] sm:text-lg">
              Get clear transaction records, estimated income, and financial reports from your wallet in seconds.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#111017] px-9 py-4 text-sm font-bold text-white shadow-2xl shadow-[#564870]/20 transition hover:bg-[#2a2733] active:scale-[0.98]"
              >
                <span>Analyze my wallet</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </a>
              <a
                href="#how-it-works"
                className="btn-ghost flex items-center gap-2 px-8 py-4 text-sm font-semibold transition"
              >
                <span>Explore how it works</span>
              </a>
            </div>
          </div>
        </section> */}
      </main>

      <SiteFooter />
    </div>
  );
}