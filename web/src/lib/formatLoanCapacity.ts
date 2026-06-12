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

/** Always present loan capacity as a range — for lender-facing reports. */
export function formatReportLoanCapacity(loan: LoanCapacityLike): string {
  const { minLoanUsd, maxLoanUsd, range } = loan;
  if (maxLoanUsd <= 0 && minLoanUsd <= 0) return "Not eligible";

  const spread = maxLoanUsd - minLoanUsd;
  const threshold = Math.max(50, Math.max(maxLoanUsd, minLoanUsd) * 0.05);
  if (spread > threshold) {
    return `$${minLoanUsd.toLocaleString()} – $${maxLoanUsd.toLocaleString()} USD`;
  }

  if (range && /[-–]/.test(range)) {
    const cleaned = range.replace(/\$/g, "").trim();
    return cleaned.includes("USD") ? cleaned : `${cleaned} USD`;
  }

  const estimate = Math.round((minLoanUsd + maxLoanUsd) / 2) || maxLoanUsd || minLoanUsd;
  const low = Math.max(0, Math.round(estimate * 0.88));
  const high = Math.round(estimate * 1.12);
  return `$${low.toLocaleString()} – $${high.toLocaleString()} USD`;
}
