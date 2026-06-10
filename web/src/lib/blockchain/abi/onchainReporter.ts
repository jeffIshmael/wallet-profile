export const onchainReporterAbi = [
  {
    type: "function",
    name: "publishFinancialReport",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "buyer", type: "address" },
      { name: "reputationScore", type: "uint8" },
      { name: "financialHealthScore", type: "uint8" },
      { name: "loanCapacity", type: "string" },
      { name: "reportHash", type: "string" }
    ],
    outputs: [{ name: "reportId", type: "uint256" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "verifyReport",
    inputs: [{ name: "reportId", type: "uint256" }],
    outputs: [
      { name: "exists", type: "bool" },
      {
        name: "attestation",
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "buyer", type: "address" },
          { name: "reputationScore", type: "uint8" },
          { name: "financialHealthScore", type: "uint8" },
          { name: "loanCapacity", type: "string" },
          { name: "reportHash", type: "string" },
          { name: "publishedAt", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "verifyReportByHash",
    inputs: [{ name: "reportHash", type: "string" }],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "reportId", type: "uint256" },
      {
        name: "attestation",
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "buyer", type: "address" },
          { name: "reputationScore", type: "uint8" },
          { name: "financialHealthScore", type: "uint8" },
          { name: "loanCapacity", type: "string" },
          { name: "reportHash", type: "string" },
          { name: "publishedAt", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "event",
    name: "FinancialReportPublished",
    inputs: [
      { name: "reportId", type: "uint256", indexed: true },
      { name: "wallet", type: "address", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "reputationScore", type: "uint8", indexed: false },
      { name: "financialHealthScore", type: "uint8", indexed: false },
      { name: "loanCapacity", type: "string", indexed: false },
      { name: "reportHash", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false }
    ]
  }
] as const;
