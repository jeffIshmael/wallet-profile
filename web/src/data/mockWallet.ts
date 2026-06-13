export const mockWallet = {
  walletAddress: "0x4821ced48fb4456055c86e42587f61c1f39c6315",
  ens: null,
  walletAgeMonths: 28,
  walletAgeDays: 850,
  celoPrice: 0.06087,
  totalTransactions: 312,
  portfolio: {
    stablecoinBalance: 3600,
    volatileBalance: 1200,
    defiExposure: 660,
    nftCount: 2,
    nftExposure: 540,
    totalValueUsd: 6000
  },
  tokens: [
    { symbol: "USDC", name: "USD Coin", balance: 48.5, usdValue: 48.5, isStable: true },
    { symbol: "USDT", name: "Tether", balance: 0.2, usdValue: 0.2, isStable: true },
    { symbol: "USDm", name: "USDm", balance: 1.2, usdValue: 1.2, isStable: true },
    { symbol: "CELO", name: "Celo Native Asset", balance: 0.145, usdValue: 0.0088, isStable: false }
  ],
  incomeByPeriod: {
    "1M": { inbound: 1250, outbound: 680, net: 570, trendPct: 8 },
    "3M": { inbound: 3750, outbound: 2040, net: 1710, trendPct: 18 },
    "6M": { inbound: 7500, outbound: 4080, net: 3420, trendPct: 12 },
    "12M": { inbound: 15000, outbound: 8160, net: 6840, trendPct: 22 }
  },
  statementSparkbars: {
    "1M": { inflow: [980, 1100, 1050, 1250], outflow: [720, 680, 710, 680], net: [260, 420, 340, 570] },
    "3M": { inflow: [3100, 3400, 3600, 3750], outflow: [1900, 2000, 2100, 2040], net: [1200, 1400, 1500, 1710] },
    "6M": { inflow: [6200, 6800, 7100, 7500], outflow: [3800, 3900, 4000, 4080], net: [2400, 2900, 3100, 3420] },
    "12M": { inflow: [12000, 13000, 14000, 15000], outflow: [7600, 7800, 8000, 8160], net: [4400, 5200, 6000, 6840] }
  },
  statementMonthlyFlow: {
    "1M": [
      { month: "May", inflow: 1250, outflow: 680 }
    ],
    "3M": [
      { month: "Mar", inflow: 1100, outflow: 650 },
      { month: "Apr", inflow: 1250, outflow: 720 },
      { month: "May", inflow: 1400, outflow: 670 }
    ],
    "6M": [
      { month: "Dec", inflow: 1200, outflow: 900 },
      { month: "Jan", inflow: 1350, outflow: 980 },
      { month: "Feb", inflow: 1100, outflow: 1050 },
      { month: "Mar", inflow: 1450, outflow: 1100 },
      { month: "Apr", inflow: 1600, outflow: 1170 },
      { month: "May", inflow: 1700, outflow: 1000 }
    ],
    "12M": [
      { month: "Jun", inflow: 1100, outflow: 700 },
      { month: "Jul", inflow: 1200, outflow: 750 },
      { month: "Aug", inflow: 1300, outflow: 800 },
      { month: "Sep", inflow: 1250, outflow: 820 },
      { month: "Oct", inflow: 1400, outflow: 900 },
      { month: "Nov", inflow: 1500, outflow: 950 },
      { month: "Dec", inflow: 1200, outflow: 900 },
      { month: "Jan", inflow: 1350, outflow: 980 },
      { month: "Feb", inflow: 1100, outflow: 1050 },
      { month: "Mar", inflow: 1450, outflow: 1100 },
      { month: "Apr", inflow: 1600, outflow: 1170 },
      { month: "May", inflow: 1700, outflow: 1000 }
    ]
  },
  tokenFlows: [
    { symbol: "USDT", name: "Tether", inflow: 5200, outflow: 2800, net: 2400, usd: 2400 },
    { symbol: "USDC", name: "USD Coin", inflow: 4800, outflow: 2100, net: 2700, usd: 2700 },
    { symbol: "USDm", name: "USDm", inflow: 4600, outflow: 1800, net: 2800, usd: 2800 },
    { symbol: "CELO", name: "Celo Native Asset", inflow: 1800, outflow: 1460, net: 340, usd: 340 }
  ],
  transactions: [
    {
      timestamp: "2026-05-28T14:22:00.000Z",
      token: "USDT",
      amount: 420,
      direction: "Incoming" as const,
      amountToken: 420,
      recipient: "0x7a3f0000000000000000000000000000009c12",
      hash: "0xaa647c82e0cc8f43f639672c58b5f246219bdb28b27ac793e8e87181f959d073"
    },
    {
      timestamp: "2026-05-26T09:15:00.000Z",
      token: "USDC",
      amount: 180,
      direction: "Outgoing" as const,
      amountToken: 180,
      recipient: "0x2b910000000000000000000000000000004e88",
      hash: "0xd4752aa1fde1f9584ab802a000b94ecde313a38044b3978ae45bd5a85de94bd3"
    },
    {
      timestamp: "2026-05-24T18:40:00.000Z",
      token: "USDm",
      amount: 650,
      direction: "Incoming" as const,
      amountToken: 650,
      recipient: "0x9c440000000000000000000000000000001a07",
      hash: "0x3f8a2bc1d9e4f5678901234567890abcdef1234567890abcdef1234567890ab"
    },
    {
      timestamp: "2026-05-22T11:05:00.000Z",
      token: "USDT",
      amount: 95,
      direction: "Outgoing" as const,
      amountToken: 95,
      recipient: "0x5d120000000000000000000000000000008f33",
      hash: "0x1a2b3c4d5e6f7890123456789012345678901234567890123456789012345678"
    },
    {
      timestamp: "2026-05-20T16:30:00.000Z",
      token: "USDC",
      amount: 1250,
      direction: "Incoming" as const,
      amountToken: 1250,
      recipient: "0x8e770000000000000000000000000000002b19",
      hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    },
    {
      timestamp: "2026-05-18T08:12:00.000Z",
      token: "CELO",
      amount: 240,
      direction: "Outgoing" as const,
      amountToken: 240,
      recipient: "0x1f660000000000000000000000000000007d44",
      hash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
    }
  ],
  growthHistory: {
    All: [
      { month: "Jun 24", value: 1200 },
      { month: "Jul 24", value: 1450 },
      { month: "Aug 24", value: 1680 },
      { month: "Sep 24", value: 1920 },
      { month: "Oct 24", value: 2100 },
      { month: "Nov 24", value: 2350 },
      { month: "Dec 24", value: 2600 },
      { month: "Jan 25", value: 2900 },
      { month: "Feb 25", value: 3200 },
      { month: "Mar 25", value: 3600 },
      { month: "Apr 25", value: 4100 },
      { month: "May 25", value: 4600 },
      { month: "Jun 25", value: 5100 },
      { month: "Jul 25", value: 5400 },
      { month: "Aug 25", value: 5600 },
      { month: "Sep 25", value: 5750 },
      { month: "Oct 25", value: 5850 },
      { month: "Nov 25", value: 5920 },
      { month: "Dec 25", value: 5960 },
      { month: "Jan 26", value: 5980 },
      { month: "Feb 26", value: 5990 },
      { month: "Mar 26", value: 5995 },
      { month: "Apr 26", value: 5998 },
      { month: "May 26", value: 6000 }
    ],
    USDC: [
      { month: "Jun 24", value: 400 },
      { month: "Jul 24", value: 520 },
      { month: "Aug 24", value: 640 },
      { month: "Sep 24", value: 780 },
      { month: "Oct 24", value: 920 },
      { month: "Nov 24", value: 1050 },
      { month: "Dec 24", value: 1200 },
      { month: "Jan 25", value: 1380 },
      { month: "Feb 25", value: 1520 },
      { month: "Mar 25", value: 1680 },
      { month: "Apr 25", value: 1820 },
      { month: "May 25", value: 1920 },
      { month: "Jun 25", value: 1980 },
      { month: "Jul 25", value: 2020 },
      { month: "Aug 25", value: 2050 },
      { month: "Sep 25", value: 2070 },
      { month: "Oct 25", value: 2085 },
      { month: "Nov 25", value: 2090 },
      { month: "Dec 25", value: 2095 },
      { month: "Jan 26", value: 2098 },
      { month: "Feb 26", value: 2099 },
      { month: "Mar 26", value: 2100 },
      { month: "Apr 26", value: 2100 },
      { month: "May 26", value: 2100 }
    ],
    USDT: [
      { month: "Jun 24", value: 300 },
      { month: "Jul 24", value: 420 },
      { month: "Aug 24", value: 540 },
      { month: "Sep 24", value: 680 },
      { month: "Oct 24", value: 820 },
      { month: "Nov 24", value: 960 },
      { month: "Dec 24", value: 1100 },
      { month: "Jan 25", value: 1220 },
      { month: "Feb 25", value: 1320 },
      { month: "Mar 25", value: 1380 },
      { month: "Apr 25", value: 1420 },
      { month: "May 25", value: 1450 },
      { month: "Jun 25", value: 1470 },
      { month: "Jul 25", value: 1480 },
      { month: "Aug 25", value: 1490 },
      { month: "Sep 25", value: 1495 },
      { month: "Oct 25", value: 1498 },
      { month: "Nov 25", value: 1499 },
      { month: "Dec 25", value: 1500 },
      { month: "Jan 26", value: 1500 },
      { month: "Feb 26", value: 1500 },
      { month: "Mar 26", value: 1500 },
      { month: "Apr 26", value: 1500 },
      { month: "May 26", value: 1500 }
    ],
    USDm: [
      { month: "Jun 24", value: 180 },
      { month: "Jul 24", value: 260 },
      { month: "Aug 24", value: 345 },
      { month: "Sep 24", value: 432 },
      { month: "Oct 24", value: 518 },
      { month: "Nov 24", value: 600 },
      { month: "Dec 24", value: 665 },
      { month: "Jan 25", value: 728 },
      { month: "Feb 25", value: 790 },
      { month: "Mar 25", value: 850 },
      { month: "Apr 25", value: 900 },
      { month: "May 25", value: 935 },
      { month: "Jun 25", value: 963 },
      { month: "Jul 25", value: 977 },
      { month: "Aug 25", value: 988 },
      { month: "Sep 25", value: 994 },
      { month: "Oct 25", value: 997 },
      { month: "Nov 25", value: 998 },
      { month: "Dec 25", value: 999 },
      { month: "Jan 26", value: 999 },
      { month: "Feb 26", value: 999 },
      { month: "Mar 26", value: 999 },
      { month: "Apr 26", value: 1000 },
      { month: "May 26", value: 1000 }
    ],
    CELO: [
      { month: "Jun 24", value: 800 },
      { month: "Jul 24", value: 850 },
      { month: "Aug 24", value: 900 },
      { month: "Sep 24", value: 920 },
      { month: "Oct 24", value: 950 },
      { month: "Nov 24", value: 980 },
      { month: "Dec 24", value: 1000 },
      { month: "Jan 25", value: 1020 },
      { month: "Feb 25", value: 1050 },
      { month: "Mar 25", value: 1080 },
      { month: "Apr 25", value: 1100 },
      { month: "May 25", value: 1120 },
      { month: "Jun 25", value: 1140 },
      { month: "Jul 25", value: 1150 },
      { month: "Aug 25", value: 1160 },
      { month: "Sep 25", value: 1170 },
      { month: "Oct 25", value: 1175 },
      { month: "Nov 25", value: 1180 },
      { month: "Dec 25", value: 1185 },
      { month: "Jan 26", value: 1190 },
      { month: "Feb 26", value: 1195 },
      { month: "Mar 26", value: 1198 },
      { month: "Apr 26", value: 1199 },
      { month: "May 26", value: 1200 }
    ]
  },
  firstTransaction: {
    hash: "0xd4752aa1fde1f9584ab802a000b94ecde313a38044b3978ae45bd5a85de94bd3",
    timestamp: "2024-02-15T05:50:08.000Z",
    token: "CELO"
  },
  lastTransaction: {
    hash: "0xaa647c82e0cc8f43f639672c58b5f246219bdb28b27ac793e8e87181f959d073",
    timestamp: "2026-05-29T18:56:57.000Z",
    token: "USDT"
  },
  metrics: {
    financialHealth: {
      score: 89,
      breakdown: {
        incomeStability: 92,
        savingsDiscipline: 88,
        portfolioRisk: 85,
        spendingDiscipline: 90,
        walletMaturity: 86,
        debtRiskSignals: 94
      }
    },
    reputation: {
      score: 92,
      category: "Highly Trusted",
      rationale:
        "This wallet shows a long history of consistent activity and healthy financial behavior."
    },
    risk: {
      category: "Low",
      allocation: { stablecoin: 60, volatile: 20, defi: 11, nft: 9 }
    },
    incomeProfile: {
      label: "Stable Earner" as const,
      score: 92,
      monthlyEstimateUsd: 1250,
      weeklyConsistency: 92,
      averageInflowUsd: 1250,
      recurringSenderPatterns: true,
      flag: "🇰🇪"
    },
    loanCapacity: {
      range: "$1,800 - $2,400",
      minLoanUsd: 1800,
      maxLoanUsd: 2400,
      scaleMaxUsd: 5000,
      confidence: "High",
      factors: { incomeConsistency: 87, reputation: 92, riskProfile: "Medium" as const }
    }
  },
  monthlyIncomeHistory: [980, 1100, 1050, 1180, 1320, 1250],
  monthlyIncomeStats: { changePct: 12, highest: 1840, lowest: 620 },
  cashFlow: {
    periodLabel: "6mo",
    inflows: 8400,
    outflows: 6200,
    net: 2200,
    monthly: [
      { month: "Dec", in: 1200, out: 900 },
      { month: "Jan", in: 1350, out: 980 },
      { month: "Feb", in: 1100, out: 1050 },
      { month: "Mar", in: 1450, out: 1100 },
      { month: "Apr", in: 1600, out: 1170 },
      { month: "May", in: 1700, out: 1000 }
    ]
  },
  onfraAssessment: {
    narrative:
      "This wallet demonstrates strong financial discipline over 2.4 years of consistent activity. Income inflows are stable and predictable, stablecoin exposure is high, and transaction history shows no high-risk behavior. Recommended for moderate credit products.",
    strengths: [
      "Wallet active for 2.4 years",
      "Stable monthly inflows detected",
      "Low portfolio risk exposure",
      "Strong stablecoin holdings",
      "Consistent transaction history"
    ],
    watchItems: ["No ENS name registered", "Moderate DeFi exposure"]
  },
  aiSummary: [
    "Wallet active for 2.4 years",
    "Stable monthly inflows detected",
    "Low portfolio risk exposure",
    "Strong stablecoin holdings",
    "Consistent transaction history",
    "Suitable for moderate borrowing"
  ],
  reportPricing: {
    "3M": "0.10 USDT",
    "6M": "0.12 USDT",
    "12M": "0.15 USDT"
  },
  verificationCode: "WP-7A30EF182A4729CB",
  attestation: {
    hash: "0x7a30ef182a4729cb251d8b92fd2381f9c8fcd918374d89b1c7a8efb472e3914a",
    paragraph:
      "This document serves as an official financial attestation generated by Chainalyse AI. Wallet address 0x4821ced48fb4456055c86e42587f61c1f39c6315 shows a weighted Financial Health Index of 89% and a Trust Reputation Score of 92/100. The estimated borrowing capacity is certified within the range of $1,800 - $2,400."
  }
} as const;

export type MockWallet = typeof mockWallet;
