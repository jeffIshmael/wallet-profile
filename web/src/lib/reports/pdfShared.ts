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

export const DOCUMENT_HEADER_HEIGHT = 40;

const LOGO_LIGHT_PATH = "/logo_light.png";

type Point = { x: number; y: number };

function cubicBezier(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y
  };
}

function sampleCurve(p0: Point, p1: Point, p2: Point, p3: Point, steps = 48): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => cubicBezier(i / steps, p0, p1, p2, p3));
}

function sliceCurveFrom(points: Point[], startRatio: number): Point[] {
  const start = Math.floor(points.length * startRatio);
  return points.slice(start);
}

function offsetCurveY(points: Point[], deltaY: number): Point[] {
  return points.map((p) => ({ x: p.x, y: p.y + deltaY }));
}

function fillPolygon(doc: jsPDF, points: Point[], color: readonly [number, number, number]) {
  if (points.length < 3) return;
  doc.setFillColor(color[0], color[1], color[2]);
  const ops: number[][] = [];
  for (let i = 1; i < points.length; i++) {
    ops.push([points[i].x - points[i - 1].x, points[i].y - points[i - 1].y]);
  }
  doc.lines(ops, points[0].x, points[0].y, [1, 1], "F", true);
}

/** Fill the closed region between two left→right curves (top edge + bottom edge). */
function fillBandBetweenCurves(
  doc: jsPDF,
  topEdge: Point[],
  bottomEdge: Point[],
  color: readonly [number, number, number]
) {
  fillPolygon(doc, [...topEdge, ...bottomEdge.slice().reverse()], color);
}

/** Smooth swoosh header — orange top stripe, navy wave, right orange trim, left accent. */
function drawCurvedHeaderGraphics(doc: jsPDF, pageWidth: number, headerHeight: number) {
  const navy = REPORT_THEME.bg;
  const orange = REPORT_THEME.accent;
  const white = [255, 255, 255] as const;
  const w = pageWidth;

  doc.setFillColor(white[0], white[1], white[2]);
  doc.rect(0, 0, w, headerHeight, "F");

  const orangeBottom = sampleCurve(
    { x: 0, y: 1.2 },
    { x: w * 0.42, y: 2.4 },
    { x: w * 0.78, y: 2 },
    { x: w, y: 1.3 }
  );
  fillBandBetweenCurves(doc, [{ x: 0, y: 0 }, { x: w, y: 0 }], orangeBottom, orange);

  const navyTop = offsetCurveY(orangeBottom, 0.35);
  const navyBottom = sampleCurve(
    { x: 0, y: 13.5 },
    { x: w * 0.26, y: 18 },
    { x: w * 0.64, y: 21.5 },
    { x: w, y: 12.5 }
  );
  fillBandBetweenCurves(doc, navyTop, navyBottom, navy);

  const navyBottomRight = sliceCurveFrom(navyBottom, 0.48);
  const orangeTrimBottom = offsetCurveY(navyBottomRight, 1.1);
  fillBandBetweenCurves(doc, navyBottomRight, orangeTrimBottom, orange);

  const leftAccentTop = sampleCurve(
    { x: 0, y: headerHeight - 4.5 },
    { x: w * 0.06, y: headerHeight - 9 },
    { x: w * 0.17, y: headerHeight - 9.5 },
    { x: w * 0.3, y: headerHeight - 5 }
  );
  fillBandBetweenCurves(
    doc,
    leftAccentTop,
    [
      { x: 0, y: headerHeight },
      { x: w * 0.3, y: headerHeight }
    ],
    navy
  );
}

export type DocumentHeaderOptions = {
  doc: jsPDF;
  pageWidth: number;
  margin: number;
  logoDataUrl: string | null;
  /** Second line under the Chainalyse wordmark (orange). */
  subtitle: string;
  /** Small badge shown on the navy swoosh (top-right). */
  badge: string;
};

/** Draw shared curved header; returns Y for body content below the header band. */
export function drawCurvedDocumentHeader({
  doc,
  pageWidth,
  margin,
  logoDataUrl,
  subtitle,
  badge
}: DocumentHeaderOptions): number {
  const headerHeight = DOCUMENT_HEADER_HEIGHT;
  drawCurvedHeaderGraphics(doc, pageWidth, headerHeight);

  const brandRight = pageWidth - margin;
  const logoSize = 12;
  const brandBlockRight = logoDataUrl ? brandRight - logoSize - 4 : brandRight;
  const brandY = headerHeight - 11;

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", brandRight - logoSize, brandY, logoSize, logoSize);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(REPORT_THEME.bg[0], REPORT_THEME.bg[1], REPORT_THEME.bg[2]);
  doc.text("CHAINALYSE", brandBlockRight, brandY + 4.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(REPORT_THEME.accent[0], REPORT_THEME.accent[1], REPORT_THEME.accent[2]);
  doc.text(subtitle.toUpperCase(), brandBlockRight, brandY + 9.5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  doc.setTextColor(255, 255, 255);
  doc.text(badge, pageWidth - margin, 7, { align: "right" });

  return headerHeight + 8;
}

export async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const buffer = await fs.readFile(path.join(process.cwd(), "public", "logo_light.png"));
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } catch {
      return null;
    }
  }

  try {
    const res = await fetch(LOGO_LIGHT_PATH);
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
