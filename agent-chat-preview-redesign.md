# AgentChatPreview — Section Redesign Spec
### Theme: OnFRA × BTC Orange × Void Dark — Unchanged

---

## What's Weak in the Current Design

| Element | Current Issue | Fix |
|---|---|---|
| Section label | Plain mono text "Agent chat" — no visual anchor | Pill badge with icon + mono text |
| Headline | "Talk to OnFRA about your wallet" — generic | Stronger verb, split line with orange accent word |
| Capability list | Bullet dots, plain text — reads like a ToS list | Icon cards in a 2×2 grid — scannable, visual weight |
| Pricing notice | Orange border box, wall of text — looks like a warning | Inline micro-table: action + price pairs, subtle treatment |
| CTA button | Rounded pill, orange fill — fine but isolated | Button + ghost secondary link side-by-side for unauthenticated state |
| Left/right blurs | Two static blurs, bottom and top | Keep blurs but add a faint animated pulse ring behind the phone |
| Phone mockup | Centered, no environmental context | Add a faint glow ring + floating stat chip above/below the phone |
| Spacing | `py-16 md:py-24` — adequate | Increase to `py-20 md:py-32` for more air at larger viewports |

---

## Revised Component Structure

```tsx
<section>                          // bg-void, overflow-hidden
  [Background FX layer]            // blurs + subtle grid texture
  <div grid lg:grid-cols-2>

    {/* LEFT COLUMN */}
    <div>
      [Badge pill]                  // "● AGENT CHAT" orange dot + mono text
      [Headline]                    // 2-line, one word in orange
      [Subheading]                  // shorter, punchier — 2 sentences max
      [Capability grid]             // 2×2 icon cards replacing bullet list
      [Pricing strip]               // horizontal row, not a box
      [CTA group]                   // primary button + ghost link
    </div>

    {/* RIGHT COLUMN */}
    <div>
      [Floating stat chip top]      // "92 wallets analysed today"
      [PhoneChatMockup]             // existing component, unchanged
      [Floating stat chip bottom]   // "Free for your own wallet"
    </div>

  </div>
</section>
```

---

## Element 1: Badge Pill (replaces plain `<p>` label)

**Current:**
```tsx
<p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">
  Agent chat
</p>
```

**Replacement:**
```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-btc-orange/25 bg-btc-orange/8 px-3 py-1.5">
  <span className="h-1.5 w-1.5 rounded-full bg-btc-orange animate-pulse" />
  <span className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">
    Agent Chat
  </span>
</div>
```

- Live dot pulse signals the agent is active/real-time
- Pill border frames the label as a status indicator, not a category header
- `bg-btc-orange/8` — barely visible tint so it doesn't compete with the headline

---

## Element 2: Headline (bolder, split)

**Current:**
```
Talk to OnFRA about your wallet
```

**Replacement:**
```tsx
<h1 className="mt-3 font-space text-3xl font-bold text-white md:text-4xl lg:text-5xl leading-tight">
  Your wallet,{" "}
  <span className="text-btc-orange">explained</span>
  <br />
  in plain language.
</h1>
```

- One accent word in `text-btc-orange` breaks the all-white headline visually
- Line break is intentional — creates a natural reading pause
- `lg:text-5xl` — earns the full width at desktop
- Shorter = more confident. The subheading carries the detail.

---

## Element 3: Subheading (tightened)

**Current (38 words):**
> Ask questions about your financial health, reputation score, loan capacity, or portfolio risk. OnFRA translates your onchain activity into answers lenders and you can understand.

**Replacement (22 words):**
```tsx
<p className="mt-4 max-w-md text-sm leading-7 text-stardust md:text-base">
  Ask OnFRA anything about your onchain profile. Get answers your lenders
  understand — and actions you can actually take.
</p>
```

- Front-loads the action ("Ask OnFRA anything")
- "answers your lenders understand" echoes the product's core value prop
- Shorter leaves more visual breathing room before the capability grid

---

## Element 4: Capability Grid (replaces bullet list)

**Current:** 4 bullet-dot items in a vertical `<ul>`

**Replacement:** 2×2 icon card grid

```tsx
const CAPABILITIES_WITH_ICONS = [
  { icon: "🏦", text: "Financial health & reputation scores" },
  { icon: "📊", text: "Loan capacity analysis" },
  { icon: "🔍", text: "External wallet reputation checks" },
  { icon: "📝", text: "Plain-language lender-ready reports" },
] as const;

// JSX
<div className="mt-6 grid grid-cols-2 gap-3">
  {CAPABILITIES_WITH_ICONS.map(({ icon, text }) => (
    <div
      key={text}
      className="rounded-xl border border-white/6 bg-white/3 px-4 py-3 flex items-start gap-3"
    >
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <p className="text-xs leading-5 text-stardust">{text}</p>
    </div>
  ))}
</div>
```

**Card CSS values:**
```
background:  rgba(255,255,255,0.03)   → barely lifted off void
border:      rgba(255,255,255,0.06)   → hairline, same as existing card patterns
border-radius: 12px
padding: 12px 16px
gap between icon and text: 12px
```

- 2×2 grid is faster to scan than a 4-item vertical list
- Each card is a small interactive surface — can add `hover:border-btc-orange/20 transition` for polish
- Replaces the `AGENT_CHAT_CAPABILITIES` array — update content to match icon-friendly short labels (see above)

---

## Element 5: Pricing Strip (replaces orange box)

**Current:** Orange-bordered box with one paragraph of mixed pricing info

**Replacement:** Horizontal 3-column pricing micro-table, no border box

```tsx
const PRICING_ROWS = [
  { action: "Your own wallet",     price: "Free",      highlight: true },
  { action: "External wallet query", price: "0.005 USDT", highlight: false },
  { action: "Full wallet report",  price: "0.1 USDT",  highlight: false },
] as const;

// JSX
<div className="mt-6 space-y-0">
  <p className="font-mono text-[9px] uppercase tracking-widest text-stardust/50 mb-2">
    Pricing
  </p>
  <div className="rounded-xl overflow-hidden border border-white/6">
    {PRICING_ROWS.map(({ action, price, highlight }, i) => (
      <div
        key={action}
        className={`flex items-center justify-between px-4 py-2.5 text-xs
          ${i !== PRICING_ROWS.length - 1 ? "border-b border-white/6" : ""}
          ${highlight ? "bg-btc-orange/8" : "bg-white/2"}
        `}
      >
        <span className="text-stardust">{action}</span>
        <span className={`font-mono font-semibold ${highlight ? "text-btc-orange" : "text-white"}`}>
          {price}
        </span>
      </div>
    ))}
  </div>
</div>
```

- "Free" row gets the `btc-orange` highlight — leads with the best news
- Structured table is faster to parse than a sentence
- No heavy orange border — the table itself provides structure
- Update `AGENT_CHAT_PRICING_NOTICE` export to drive this data instead of a string

---

## Element 6: CTA Group (dual action for unauthenticated)

**Current:** Single button, same for both auth states except label text

**Replacement:** Primary button + ghost secondary for unauthenticated; single button for authenticated

```tsx
// Authenticated
<div className="mt-8 flex items-center gap-4">
  <button
    onClick={onAskAgent}
    disabled={connecting}
    className="inline-flex min-h-[44px] items-center justify-center gap-2
      rounded-full bg-btc-orange px-6 py-3
      font-mono text-xs font-medium uppercase tracking-wider text-white
      shadow-[0_0_24px_-4px_rgba(247,147,26,0.5)]
      transition hover:bg-btc-orange/90 hover:scale-105 hover:shadow-[0_0_32px_-4px_rgba(247,147,26,0.65)]
      disabled:cursor-wait disabled:opacity-70"
  >
    {connecting ? "Connecting..." : "Ask OnFRA"}
    <ArrowRight size={14} />
  </button>
</div>

// Unauthenticated
<div className="mt-8 flex items-center gap-4 flex-wrap">
  <button
    onClick={onSignIn}
    className="inline-flex min-h-[44px] items-center justify-center gap-2
      rounded-full bg-btc-orange px-6 py-3
      font-mono text-xs font-medium uppercase tracking-wider text-white
      shadow-[0_0_24px_-4px_rgba(247,147,26,0.5)]
      transition hover:bg-btc-orange/90 hover:scale-105"
  >
    Get Started
    <ArrowRight size={14} />
  </button>

  <button
    onClick={onAskAgent}  // guest preview / demo mode
    className="inline-flex min-h-[44px] items-center justify-center
      font-mono text-xs uppercase tracking-wider text-stardust
      transition hover:text-white"
  >
    Try a demo query →
  </button>
</div>
```

- "Get Started" is more compelling than "Sign in" for unauthenticated visitors
- Ghost secondary link offers a low-friction alternative (demo/preview mode)
- Hover glow on primary button intensifies on hover: `shadow` transitions to stronger value
- Both wrapped in `flex-wrap` so they stack gracefully on narrow screens

---

## Element 7: Right Column — Floating Stat Chips

Add two small floating chips around the `<PhoneChatMockup />` to add environmental context:

```tsx
<div className="order-1 flex flex-col items-center gap-4 lg:order-2 relative">

  {/* Chip: top-right of phone */}
  <div className="self-end mr-4 lg:mr-0 lg:absolute lg:-top-4 lg:right-0">
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5
        px-3 py-1.5 backdrop-blur-sm shadow-lg">
      <span className="h-1.5 w-1.5 rounded-full bg-btc-orange animate-pulse" />
      <span className="font-mono text-[10px] text-stardust">92 wallets analysed today</span>
    </div>
  </div>

  {/* Ambient glow ring behind phone */}
  <div className="relative">
    <div className="absolute inset-0 rounded-[40px] bg-btc-orange/8 blur-3xl scale-90 -z-10" />
    <PhoneChatMockup />
  </div>

  {/* Chip: bottom-left of phone */}
  <div className="self-start ml-4 lg:ml-0 lg:absolute lg:-bottom-4 lg:left-0">
    <div className="flex items-center gap-2 rounded-full border border-btc-orange/20 bg-btc-orange/8
        px-3 py-1.5 backdrop-blur-sm shadow-lg">
      <span className="font-mono text-[10px] text-btc-orange">✓ Free for your own wallet</span>
    </div>
  </div>

</div>
```

- Top chip: social proof (live-feel stat with pulse dot)
- Bottom chip: reinforces the "free" pricing point right beside the product visual
- Ambient glow ring: `bg-btc-orange/8 blur-3xl` — barely visible warmth behind the phone, ties the visual to the section accent color
- Both chips use `backdrop-blur-sm` to feel like they float above the content

---

## Background Layer Improvements

**Current:** Two static `blur-[120px]` circles

**Replace with:**
```tsx
{/* Existing left blur — keep as-is */}
<div className="pointer-events-none absolute -left-20 top-20 h-64 w-64
  rounded-full bg-btc-orange/10 blur-[120px]" />

{/* Existing right blur — keep as-is */}
<div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64
  rounded-full bg-teal/5 blur-[120px]" />

{/* ADD: subtle dot-grid texture overlay */}
<div
  className="pointer-events-none absolute inset-0 opacity-[0.025]"
  style={{
    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
    backgroundSize: `28px 28px`
  }}
/>
```

The dot grid adds micro-texture to the void background without changing the color or feel — makes the section feel more intentional vs a flat dark rectangle. `opacity-[0.025]` keeps it completely subliminal.

---

## Complete Tailwind Class Reference

New utility values used (all composable from existing Tailwind + your config):

| Value | Usage |
|---|---|
| `bg-white/3` | Capability card background |
| `bg-white/5` | Floating chip background |
| `border-white/6` | Hairline borders on cards and table |
| `bg-btc-orange/8` | Pricing row highlight, ambient glow |
| `animate-pulse` | Live dot on badge and stat chip |
| `backdrop-blur-sm` | Floating chips frosted effect |
| `shadow-[0_0_32px_-4px_rgba(247,147,26,0.65)]` | Intensified button hover glow |
| `leading-tight` | Headline line-height for 3xl+ sizes |

All `btc-orange`, `void`, `stardust`, `teal` tokens are **unchanged** from your existing theme.

---

## Updated Content Exports

Replace in `chatContent.ts`:

```typescript
// Replace AGENT_CHAT_CAPABILITIES string array with icon-paired objects
export const AGENT_CHAT_CAPABILITIES = [
  { icon: "🏦", text: "Financial health & reputation scores" },
  { icon: "📊", text: "Loan capacity analysis" },
  { icon: "🔍", text: "External wallet reputation checks" },
  { icon: "📝", text: "Plain-language lender-ready reports" },
] as const;

// Replace AGENT_CHAT_PRICING_NOTICE string with structured data
export const AGENT_CHAT_PRICING = [
  { action: "Your own wallet",       price: "Free",       highlight: true  },
  { action: "External wallet query", price: "0.005 USDT", highlight: false },
  { action: "Full wallet report",    price: "0.1 USDT",   highlight: false },
] as const;

// Keep everything else as-is
```
