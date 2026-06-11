export type ChatBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] };

/** Remove markdown bold/italic markers — chat UI has no rich text. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "$1")
    .replace(/`(.*?)`/g, "$1");
}

/** Expand inline " * item * item" or "1. a 2. b" blobs into separate lines. */
function normalizeListLines(text: string): string {
  let out = text;

  // "intro text: * item * item" → intro + newline bullets
  out = out.replace(
    /([.:!?])\s+(?=\*\s)/g,
    "$1\n"
  );

  // Inline asterisk bullets on one line: " * Foo * Bar"
  if (out.includes(" * ") && !out.includes("\n• ")) {
    const segments = out.split(/\s+\*\s+/);
    if (segments.length > 1) {
      out = [segments[0]!.trim(), ...segments.slice(1).map((s) => `• ${s.trim()}`)].join("\n");
    }
  }

  // Inline numbered: "1. foo 2. bar 3. baz"
  out = out.replace(/(\d+\.\s)/g, "\n$1");
  out = out.replace(/^\n+/, "");

  return out;
}

function parseLine(line: string): ChatBlock | null {
  const bullet = line.match(/^[•\-*]\s+(.+)$/);
  if (bullet) return { type: "bullets", items: [bullet[1]!.trim()] };

  const numbered = line.match(/^\d+\.\s+(.+)$/);
  if (numbered) return { type: "numbered", items: [numbered[1]!.trim()] };

  return { type: "paragraph", text: line };
}

function mergeBlocks(blocks: ChatBlock[]): ChatBlock[] {
  const merged: ChatBlock[] = [];

  for (const block of blocks) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      (prev.type === "bullets" || prev.type === "numbered") &&
      (block.type === "bullets" || block.type === "numbered") &&
      block.type === prev.type
    ) {
      prev.items.push(...block.items);
    } else {
      merged.push(
        block.type === "bullets" || block.type === "numbered"
          ? { ...block, items: [...block.items] }
          : block
      );
    }
  }

  return merged;
}

export function parseChatMessage(raw: string): ChatBlock[] {
  const cleaned = normalizeListLines(stripMarkdown(raw));
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [{ type: "paragraph", text: stripMarkdown(raw) }];

  return mergeBlocks(
    lines.map((line) => parseLine(line) ?? { type: "paragraph", text: line })
  );
}
