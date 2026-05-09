import { BorderStyle, Paragraph, TextRun, HeadingLevel } from "docx";
import type { CVData } from "@/lib/cv-types";

export const FONT_MAP: Record<CVData["theme"]["fontFamily"], string> = {
  sans: "Calibri",
  serif: "Cambria",
  mono: "Consolas",
};

export function hexNoHash(hex: string): string {
  return (hex || "#244CEC").replace(/^#/, "").toUpperCase();
}

export function sectionHeading(text: string, accent: string, font: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: {
        color: accent,
        size: 8,
        style: BorderStyle.SINGLE,
        space: 4,
      },
    },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        font,
        size: 22,
        color: accent,
        characterSpacing: 30,
      }),
    ],
  });
}
