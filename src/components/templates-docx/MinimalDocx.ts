import { Document, Paragraph, TextRun, BorderStyle } from "docx";
import type { CVData } from "@/lib/cv-types";
import { FONT_MAP, hexNoHash } from "./shared";

export function buildMinimalDocx(data: CVData): Document {
  const accent = hexNoHash(data.theme.accentColor);
  const font = FONT_MAP[data.theme.fontFamily];
  const muted = "374151";
  const subtle = "6B7280";
  const faint = "9CA3AF";
  const body = "111111";

  const blocks: Paragraph[] = [];

  // Header
  blocks.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.personal.fullName || "Your Name",
          bold: true,
          font,
          size: 44,
          color: accent,
        }),
      ],
    }),
  );
  if (data.personal.title) {
    blocks.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: data.personal.title, font, size: 24, color: muted }),
        ],
      }),
    );
  }

  const contactBits = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.website,
  ].filter(Boolean);
  if (contactBits.length > 0) {
    blocks.push(
      new Paragraph({
        spacing: { after: 240 },
        border: {
          bottom: {
            color: "E5E7EB",
            size: 6,
            style: BorderStyle.SINGLE,
            space: 8,
          },
        },
        children: [
          new TextRun({
            text: contactBits.join("    "),
            font,
            size: 18,
            color: subtle,
          }),
        ],
      }),
    );
  }

  function minimalHeading(text: string) {
    return new Paragraph({
      spacing: { before: 240, after: 100 },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          font,
          size: 18,
          color: faint,
          characterSpacing: 60,
        }),
      ],
    });
  }

  for (const key of data.sectionOrder) {
    if (key === "profile" && data.profile) {
      blocks.push(minimalHeading("Profile"));
      blocks.push(
        new Paragraph({
          spacing: { after: 100, line: 320 },
          children: [new TextRun({ text: data.profile, font, size: 22, color: muted })],
        }),
      );
    }

    if (key === "experience" && data.experience.length > 0) {
      blocks.push(minimalHeading("Experience"));
      for (const job of data.experience) {
        blocks.push(
          new Paragraph({
            spacing: { after: 40 },
            tabStops: [{ type: "right", position: 9000 }],
            children: [
              new TextRun({ text: job.title, bold: true, font, size: 22, color: body }),
              new TextRun({
                text: job.company ? `  ·  ${job.company}` : "",
                font,
                size: 22,
                color: subtle,
              }),
              new TextRun({ text: "\t", font, size: 22 }),
              new TextRun({
                text: `${job.startDate}${job.endDate ? ` – ${job.endDate}` : ""}`,
                font,
                size: 18,
                color: subtle,
              }),
            ],
          }),
        );
        if (job.description) {
          blocks.push(
            new Paragraph({
              spacing: { after: 160, line: 320 },
              children: [new TextRun({ text: job.description, font, size: 22, color: muted })],
            }),
          );
        } else {
          blocks.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun(" ")] }));
        }
      }
    }

    if (key === "education" && data.education.length > 0) {
      blocks.push(minimalHeading("Education"));
      for (const edu of data.education) {
        blocks.push(
          new Paragraph({
            spacing: { after: 40 },
            tabStops: [{ type: "right", position: 9000 }],
            children: [
              new TextRun({ text: edu.degree, bold: true, font, size: 22, color: body }),
              new TextRun({
                text: edu.institution ? `  ·  ${edu.institution}` : "",
                font,
                size: 22,
                color: subtle,
              }),
              new TextRun({ text: "\t", font, size: 22 }),
              new TextRun({
                text: `${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ""}`,
                font,
                size: 18,
                color: subtle,
              }),
            ],
          }),
        );
        if (edu.description) {
          blocks.push(
            new Paragraph({
              spacing: { after: 160, line: 320 },
              children: [new TextRun({ text: edu.description, font, size: 22, color: muted })],
            }),
          );
        } else {
          blocks.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun(" ")] }));
        }
      }
    }

    if (key === "skills" && data.skills.length > 0) {
      blocks.push(minimalHeading("Skills"));
      blocks.push(
        new Paragraph({
          spacing: { after: 100, line: 320 },
          children: [
            new TextRun({
              text: data.skills.join("    ·    "),
              font,
              size: 22,
              color: muted,
            }),
          ],
        }),
      );
    }
  }

  return new Document({
    creator: "CV Studio",
    title: data.personal.fullName || "CV",
    styles: {
      default: {
        document: { run: { font, size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1440, right: 1440 },
          },
        },
        children: blocks,
      },
    ],
  });
}
