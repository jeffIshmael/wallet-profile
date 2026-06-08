# Design 3 — "Bold Split"
> Directly inspired by Jot's layout: a dominant color-blocked hero with strong typographic hierarchy left, and an interactive product panel right — but reinterpreted for a crypto-native brand.

---

## Visual Identity

| Token | Value |
|---|---|
| **Hero bg** | `#0f3460` (deep cobalt — authority + trust) |
| **Page bg** | `#ffffff` |
| **Section alt** | `#f4f7ff` (cool blue-tinted white) |
| **Accent 1** | `#f7c948` (bright yellow-gold — like Jot's CTA) |
| **Accent 2** | `#22d3a4` (bright mint teal) |
| **Accent 3** | `#ff6b6b` (soft red — negative signals/risk) |
| **Text on hero** | `#ffffff` |
| **Text on white** | `#0f1c2e` |
| **Font — Display** | Cabinet Grotesk 800 (bold, wide) |
| **Font — Body** | Outfit 400/500 |
| **Font — Mono** | IBM Plex Mono (addresses) |
| **Border style** | `1.5px solid #e2e8f0` |
| **Radius** | `16px` hero panel, `10px` cards, `6px` buttons |

---

## Hero Section Layout

**Pattern:** Full-bleed cobalt hero section (like Jot's teal), left headline + CTA, right is a floating white card panel showing the wallet-to-score flow — it "breaks out" of the hero vertically, overlapping into the next section below.

```
┌──────────────────────────────────────────────────────────────┐
│  NAV: ChainScore  ···  How It Works  Features  For Lenders   │
│                                            [Log In] [Sign Up]│
├──────────────────────────────────────────────────────────────┤
│██████████████████████████████████████████████████████████████│
│██████████████████████████████████████████████████████████████│
│██  The proof of income    ████████████████████████████████████│
│██  your lender needs.    █ ┌─────── WHITE CARD ──────────┐ ██│
│██                        █ │                              │ ██│
│██  Crypto earners        █ │  🔗 Enter wallet address    │ ██│
│██  deserve credit.       █ │  ┌──────────────────────┐   │ ██│
│██  ChainScore turns      █ │  │  0x4f3a...b82c  ✓    │   │ ██│
│██  your wallet history   █ │  └──────────────────────┘   │ ██│
│██  into a financial      █ │                              │ ██│
│██  passport lenders      █ │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │ ██│
│██  understand.           █ │  │87 │ │91 │ │78%│ │$2k│   │ ██│
│██                        █ │  │   │ │   │ │   │ │   │   │ ██│
│██  [Sign Up Free]        █ │  └───┘ └───┘ └───┘ └───┘   │ ██│
│██  [See a Sample Report] █ │                              │ ██│
│██████████████████████████ │  [Download Report · 0.1 USDT]│ ██│
│██████████████████████████ └──────────────────────────────┘ ██│
│████████████████████████████████  ↑ card overlaps below  █████│
├──────────────────────────────────────────────────────────────┤
│                  (white section begins here,                  │
│                   card floats down into it)                   │
│  Trusted by Saccos, DAOs, and microfinance institutions      │
└──────────────────────────────────────────────────────────────┘
```

**The overlapping card is the signature element** — it's positioned `absolute` or with negative margin-bottom so it visually connects the hero to the content below, similar to how Jot's photo bleeds into the hero card dropdown.

---

## Hero Right Panel — Wallet Flow Detail

The white card on the right has three internal states that transition automatically on demo, or respond to user input:

### State 1: Idle (default)
```
┌──────────────────────────────────┐
│  Analyze your wallet             │
│  ────────────────────────────    │
│  ┌────────────────────────────┐  │
│  │  0x...                     │  │  ← blinking cursor
│  └────────────────────────────┘  │
│  [Analyze Wallet for Free →]     │
│                                  │
│  ──── or connect directly ────   │
│  [🦊 MetaMask] [🔵 Coinbase]    │
└──────────────────────────────────┘
```

### State 2: Analyzing (500ms → 2s)
```
┌──────────────────────────────────┐
│  Analyzing 0x4f3a...b82c         │
│  ────────────────────────────    │
│  ███████████████░░░░░  Reading txns      │
│  ████████░░░░░░░░░░░░  Scoring income   │
│  ███░░░░░░░░░░░░░░░░░  Assessing risk   │
│                                  │
│  Powered by OnFRA · ERC-8004     │
└──────────────────────────────────┘
```

### State 3: Results
```
┌──────────────────────────────────┐
│  0x4f3a...b82c  ● Active         │
│  ────────────────────────────    │
│  ┌────────┐  ┌────────┐          │
│  │  87    │  │  91    │          │
│  │Health  │  │ Rep.   │          │
│  └────────┘  └────────┘          │
│  ┌────────┐  ┌────────┐          │
│  │  78%   │  │$2,400+ │          │
│  │Income  │  │ Loan   │          │
│  └────────┘  └────────┘          │
│                                  │
│  [⬇ Download Report · 0.1 USDT] │
└──────────────────────────────────┘
```

```tsx
// HeroWalletCard.tsx
type Stage = 'idle' | 'analyzing' | 'results'

const [stage, setStage] = useState<Stage>('idle')

const handleAnalyze = async (address: string) => {
  setStage('analyzing')
  const data = await fetchWalletScore(address)
  setStage('results')
}
```

---

## Score Cards — Visual Detail

Each of the 4 score boxes uses a consistent component with state-driven coloring:

```tsx
interface ScoreCardProps {
  label: string
  value: string | number
  sublabel?: string
  variant: 'gold' | 'teal' | 'neutral'
}
```

| Score | Variant | Color |
|---|---|---|
| Financial Health (87) | `gold` | `#f7c948` background tint |
| Reputation Score (91) | `gold` | `#f7c948` background tint |
| Income Stability (78%) | `teal` | `#22d3a4` background tint |
| Loan Capacity ($2,400+) | `neutral` | `#f4f7ff` background |

Each card also shows a mini sparkline (3–5 data points) below the value using a tiny SVG path to suggest trend over time.

---

## Page Sections Below Hero

### Trust Bar (white bg, full-width)
On-white strip with muted logos/names: partner Saccos, DAOs, protocols. Caption: *"Used by financial institutions and crypto-native lenders across East Africa."*

### Problem (cobalt bg — mirrors hero for rhythm)
Back to cobalt — white text. Two columns:
- Left: Short punchy stat (`"87% of crypto earners can't get a bank loan."`) with source
- Right: 3 pain-point pills, each with × icon and a brief phrase

### How It Works (white bg)
4-step horizontal layout inspired by UpOrder's product walkthrough aesthetic:
- Large step number in cobalt, title, description
- Small UI illustration per step (wallet → scanner → chart → PDF)
- Connected by a dashed horizontal line

### Report Deep-Dive (blue-tinted bg `#f4f7ff`)
Full-width mockup of the PDF report — annotated with floating labels. Below it: `"Sample report available — download for free"`

### Users (white)
3-column card grid. Each card has a cobalt icon circle (initials-style), role name, use case description, and a subtle gold tag showing the primary value for that user type (e.g., "Loan Access", "Income Proof").

### OnFRA (cobalt full-bleed)
Centered, white text. Displays the ERC-8004 badge prominently. Bullet list of agent capabilities.

### CTA (gold/yellow bg — highest contrast, boldest call to action)
White card on gold background. Mirrors Jot's high-contrast CTA approach. Large headline, wallet input, price callout.

---

## Next.js Component Structure

```
/app
  /page.tsx
  /components
    /hero
      HeroSection.tsx          ← cobalt full-bleed
      HeroWalletCard.tsx       ← white floating card, 3 states
      ScoreCard.tsx            ← reusable: gold/teal/neutral variants
      AnalyzingProgress.tsx    ← progress bar animation
      SparklineChart.tsx       ← tiny SVG trend line
    /sections
      TrustBar.tsx
      ProblemSection.tsx
      HowItWorksSection.tsx
      ReportDeepDive.tsx
      UsersSection.tsx
      OnfraSection.tsx
      CtaSection.tsx
    /ui
      Button.tsx               ← variants: primary (gold), ghost, outline
      SectionWrapper.tsx       ← bg variant prop: 'white' | 'cobalt' | 'blue-tint' | 'gold'
      WalletAddressInput.tsx   ← styled mono input with chain prefix
```

### Key Libraries
- `framer-motion` — card state transitions, stagger reveals, analyzing progress bars
- `wagmi` + `connectkit` or `rainbowkit` — wallet connection buttons (MetaMask, Coinbase)
- `react-countup` — animated score numbers in results state
- `tailwindcss` — utility classes
- `recharts` or custom SVG — sparkline trend lines in score cards

### Tailwind Config
```js
colors: {
  cobalt: { DEFAULT: '#0f3460', light: '#1a4a7a', dark: '#0a2340' },
  gold:   { DEFAULT: '#f7c948', dark: '#c99b20' },
  mint:   { DEFAULT: '#22d3a4', faint: '#e8fdf7' },
  rose:   { DEFAULT: '#ff6b6b' },
  slate:  { 50: '#f4f7ff', 100: '#e8eeff' },
}
fontFamily: {
  display: ['Cabinet Grotesk', 'sans-serif'],
  body:    ['Outfit', 'sans-serif'],
  mono:    ['IBM Plex Mono', 'monospace'],
}
```

---

## The Signature Interaction: Wallet Card States

This is the centerpiece of the hero across all three designs, but in Design 3 it's the most theatrical. The card should feel like a live product demo — like you're watching ChainScore work in real time.

**Demo mode (no user input):** On page load, after 1.5s, the card auto-runs with a sample address `0xDemo...`, goes through all 3 states, and lands on results. This lets visitors see the product without doing anything.

**Real mode:** User types or pastes a real address and clicks Analyze.

---

## Mood
**Stripe × Jot × Coinbase** — professional and bold. The cobalt hero commands authority. Gold accents scream "value". The clean white card floating against the cobalt background creates visual drama and immediately tells you what the product does. It's the most conversion-optimized of the three designs — every visual choice pushes toward "Analyze my wallet."
