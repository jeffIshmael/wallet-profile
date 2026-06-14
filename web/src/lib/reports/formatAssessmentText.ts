const SECTION_HEADER_PATTERNS = [
  /^Dashboard Summary[^:\n]*:?\s*/i,
  /^Formal Financial Attestation[^:\n]*:?\s*/i,
  /^Attestation Paragraph[^:\n]*:?\s*/i,
  /^A formal financial attestation paragraph[^:\n]*:?\s*/i,
  /^Formal financial attestation paragraph[^:\n]*:?\s*/i,
  /^Here's the analysis based on the provided metrics[:\s]*/i,
  /^Here are the requested outputs[:\s]*/i
];

/** Strip common markdown / LLM boilerplate from assessment copy. */
export function stripAssessmentMarkdown(text: string): string {
  let result = text
    .replace(/^---+\s*$/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/Here are the requested outputs:\s*/gi, "")
    .replace(/^Based on the provided metrics[,:]?\s*/i, "")
    .replace(/^Here's the analysis based on the provided metrics[,:]?\s*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  for (const pattern of SECTION_HEADER_PATTERNS) {
    result = result.replace(pattern, "");
  }

  return result.trim();
}

/** Remove trailing list markers like "**2." left over from a two-part LLM response. */
function removeTrailingListMarkers(text: string): string {
  return text
    .replace(/\s*\*{0,2}\d+\.\s*(\*{0,2})?\s*$/g, "")
    .replace(/\s*---+\s*$/g, "")
    .trim();
}

/** Remove attestation header fragments like "Paragraph" or "financial attestation paragraph". */
function removeAttestationLeadIn(text: string): string {
  return text
    .replace(/^(?:Formal\s+)?(?:financial\s+)?attestation\s+paragraph\s*/i, "")
    .replace(/^Paragraph\s*/i, "")
    .replace(/^\d+\.\s*(?:A\s+)?(?:formal\s+)?(?:financial\s+)?attestation\s+paragraph\s*/i, "")
    .trim();
}

/** Pull a concise dashboard summary from a noisy LLM narrative. */
export function extractDashboardSummary(narrative: string): string {
  const cleaned = stripAssessmentMarkdown(narrative);

  const sectionMatch = cleaned.match(
    /Dashboard Summary[^:\n]*:?\s*([\s\S]*?)(?=\d+\.\s*(?:A\s+)?Formal Financial|Formal Financial Attestation|Attestation Paragraph|Attestation\b|$)/i
  );
  if (sectionMatch?.[1]?.trim()) {
    return removeTrailingListMarkers(sectionMatch[1].trim().replace(/^\d+\.\s*/, ""));
  }

  const beforeAttestation = cleaned.split(
    /\d+\.\s*(?:A\s+)?(?:Formal Financial Attestation|formal financial attestation paragraph)|Formal Financial Attestation|Attestation Paragraph:/i
  )[0];

  const paragraphs = (beforeAttestation ?? cleaned)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !/^(Dashboard Summary|Formal Financial|Attestation)/i.test(line) &&
        !/^---+$/.test(line) &&
        !/^\d+\.\s*(?:A\s+)?(?:formal|Formal)/i.test(line)
    );

  if (paragraphs.length > 0) {
    return removeTrailingListMarkers(paragraphs.slice(0, 3).join(" "));
  }

  return removeTrailingListMarkers(cleaned);
}

/** Prefer the dedicated attestation paragraph; fall back to parsing the narrative. */
export function extractFormalAttestation(narrative: string, attestationParagraph?: string): string {
  let text = attestationParagraph?.trim()
    ? stripAssessmentMarkdown(attestationParagraph)
    : "";

  if (!text) {
    const cleaned = stripAssessmentMarkdown(narrative);
    const sectionMatch = cleaned.match(
      /(?:\d+\.\s*(?:A\s+)?)?(?:Formal Financial Attestation|Attestation Paragraph|Attestation)[^:\n]*:?\s*([\s\S]+)/i
    );
    text = sectionMatch?.[1]?.trim() ?? "";
  }

  return removeAttestationLeadIn(text);
}
