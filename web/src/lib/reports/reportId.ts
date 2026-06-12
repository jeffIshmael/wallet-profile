import { randomBytes } from "crypto";

export const REPORT_ID_PREFIX = "REP-";
export const REPORT_ID_BODY_LENGTH = 10;
export const REPORT_ID_PATTERN = /^REP-[A-Z0-9]{10}$/;

const ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** Opaque verification code: REP- + 10 uppercase alphanumeric characters. */
export function generateReportId(): string {
  const bytes = randomBytes(REPORT_ID_BODY_LENGTH);
  let suffix = "";
  for (let i = 0; i < REPORT_ID_BODY_LENGTH; i++) {
    suffix += ALPHANUM[bytes[i]! % ALPHANUM.length];
  }
  return `${REPORT_ID_PREFIX}${suffix}`;
}

export function isValidReportId(value: string): boolean {
  return REPORT_ID_PATTERN.test(value.trim());
}

export function normalizeReportId(value: string): string {
  return value.trim().toUpperCase();
}
