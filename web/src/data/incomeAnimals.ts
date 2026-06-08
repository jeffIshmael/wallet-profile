export const incomeAnimals = {
  "Stable Earner": {
    emoji: "🐘",
    title: "Stable Earner",
    description: "Reliable, predictable, strong recurring inflows."
  },
  "Growing Wallet": {
    emoji: "🦅",
    title: "Growing Wallet",
    description: "Growing, expanding, strong trajectory."
  },
  "Seasonal Earner": {
    emoji: "🐬",
    title: "Seasonal Earner",
    description: "Active in cycles with regular peaks."
  },
  "Volatile Income": {
    emoji: "🐒",
    title: "Volatile Income",
    description: "Unpredictable, highly variable inflows."
  },
  "Whale Activity": {
    emoji: "🐋",
    title: "Whale Activity",
    description: "Very large transfers, high-value wallet."
  },
  "Dormant Wallet": {
    emoji: "🐢",
    title: "Dormant Wallet",
    description: "Very little activity, slow-moving wallet."
  }
} as const;

export type IncomeAnimalKey = keyof typeof incomeAnimals;
