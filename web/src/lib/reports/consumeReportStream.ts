import type { ReportProgressEvent } from "@/types/reportProgress";

export async function consumeReportProgressStream(
  response: Response,
  onEvent: (event: ReportProgressEvent) => void
): Promise<void> {
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Report request failed (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("ndjson")) {
    const payload = (await response.json()) as ReportProgressEvent & { error?: string };
    if ("type" in payload) {
      onEvent(payload);
      if (payload.type === "error") {
        throw new Error(payload.message);
      }
      return;
    }
    throw new Error("Unexpected report response format.");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Report stream is not readable.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let sawDone = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const event = JSON.parse(trimmed) as ReportProgressEvent;
      onEvent(event);

      if (event.type === "error") {
        throw new Error(event.message);
      }
      if (event.type === "done") {
        sawDone = true;
      }
    }
  }

  if (buffer.trim()) {
    const event = JSON.parse(buffer.trim()) as ReportProgressEvent;
    onEvent(event);
    if (event.type === "error") {
      throw new Error(event.message);
    }
    if (event.type === "done") {
      sawDone = true;
    }
  }

  if (!sawDone) {
    throw new Error("Report stream ended before completion.");
  }
}
