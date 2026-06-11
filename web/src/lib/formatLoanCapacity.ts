type LoanCapacityLike = {
  range: string;
  minLoanUsd: number;
  maxLoanUsd: number;
};

/** Human-readable loan capacity — single estimate when min ≈ max. */
export function formatLoanCapacityLabel(loan: LoanCapacityLike): string {
  const { minLoanUsd, maxLoanUsd } = loan;
  if (maxLoanUsd <= 0) return "Not eligible yet";

  const spread = maxLoanUsd - minLoanUsd;
  const threshold = Math.max(50, maxLoanUsd * 0.05);
  if (spread <= threshold) {
    const estimate = Math.round((minLoanUsd + maxLoanUsd) / 2);
    return `~$${estimate.toLocaleString()}`;
  }

  return `$${minLoanUsd.toLocaleString()} – $${maxLoanUsd.toLocaleString()}`;
}

export function formatLoanCapacityRange(loan: LoanCapacityLike): string {
  const { minLoanUsd, maxLoanUsd } = loan;
  if (maxLoanUsd <= 0) return "0 USD (Ineligible)";

  const spread = maxLoanUsd - minLoanUsd;
  const threshold = Math.max(50, maxLoanUsd * 0.05);
  if (spread <= threshold) {
    const estimate = Math.round((minLoanUsd + maxLoanUsd) / 2);
    return `~$${estimate.toLocaleString()} USD`;
  }

  return `$${minLoanUsd.toLocaleString()} – $${maxLoanUsd.toLocaleString()} USD`;
}
