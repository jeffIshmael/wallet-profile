export const REPORTS_UPDATED_EVENT = "chainalyse:reports-updated";

export function dispatchReportsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT));
}
