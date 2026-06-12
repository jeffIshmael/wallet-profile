import jsPDF from "jspdf";

export const REPORT_THEME = {
  bg: [26, 26, 26] as const,
  accent: [245, 166, 35] as const,
  gold: [245, 166, 35] as const,
  text: [255, 255, 255] as const,
  textMuted: [190, 190, 200] as const,
  incoming: [0, 180, 140] as const,
  outgoing: [220, 90, 50] as const,
  body: [40, 40, 48] as const,
  surface: [248, 249, 252] as const,
  border: [225, 228, 235] as const
};

export async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const buffer = await fs.readFile(path.join(process.cwd(), "public", "logo_dark.png"));
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } catch {
      return null;
    }
  }

  try {
    const res = await fetch("/logo_dark.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function ensureSpace(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 24) {
    doc.addPage();
    return margin;
  }
  return y;
}

export function drawSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
  margin: number,
  pageWidth: number
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(REPORT_THEME.body[0], REPORT_THEME.body[1], REPORT_THEME.body[2]);
  doc.text(title, margin, y);
  doc.setDrawColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 1.5, pageWidth - margin, y + 1.5);
  return y + 7;
}

export function standardTableStyles() {
  return {
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: 2,
      textColor: [40, 40, 48] as [number, number, number],
      lineColor: [225, 228, 235] as [number, number, number],
      lineWidth: 0.2,
      overflow: "linebreak" as const
    },
    headStyles: {
      fillColor: [26, 26, 26] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold" as const,
      fontSize: 7
    },
    alternateRowStyles: { fillColor: [252, 253, 255] as [number, number, number] }
  };
}

export function getLastTableY(doc: jsPDF): number {
  return (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
}
