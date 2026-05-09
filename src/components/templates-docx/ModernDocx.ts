import { Document, Paragraph, TextRun } from "docx";
import type { CVData } from "@/lib/cv-types";
import { FONT_MAP, hexNoHash, sectionHeading } from "./shared";

export function buildModernDocx(data: CVData): Document {
  const accent = hexNoHash(data.theme.accentColor);
  const font = FONT_MAP[data.theme.fontFamily];
  const muted = "374151";
  const subtle = "6B7280";
  const body = "111111";

  const blocks: Paragraph[] = [];

  // Header — name + title
  blocks.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: data.personal.fullName || "Your Name",
          bold: true,
          font,
          size: 56,
          color: body,
        }),
      ],
    }),
  );
  if (data.personal.title) {
    blocks.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: data.personal.title, font, size: 26, color: muted }),
        ],
      }),
    );
  }

  // Contact line
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
        children: [
          new TextRun({
            text: contactBits.join("  ·  "),
            font,
            size: 20,
            color: subtle,
          }),
        ],
      }),
    );
  }

  // Sections in user-defined order
  for (const key of data.sectionOrder) {
    if (key === "profile" && data.profile) {
      blocks.push(sectionHeading("Profile", accent, font));
      blocks.push(
        new Paragraph({
          spacing: { after: 200, line: 320 },
          children: [new TextRun({ text: data.profile, font, size: 22, color: muted })],
        }),
      );
    }

    if (key === "experience" && data.experience.length > 0) {
      blocks.push(sectionHeading("Experience", accent, font));
      for (const job of data.experience) {
        blocks.push(
          new Paragraph({
            spacing: { after: 40 },
            tabStops: [{ type: "right", position: 9000 }],
            children: [
              new TextRun({ text: job.title, bold: true, font, size: 24, color: body }),
              new TextRun({ text: job.company ? `  ·  ${job.company}` : "", font, size: 22, color: muted }),
              new TextRun({ text: "\t", font, size: 22 }),
              new TextRun({
                text: `${job.startDate}${job.endDate ? ` – ${job.endDate}` : ""}`,
                font,
                size: 20,
                color: subtle,
              }),
            ],
          }),
        );
        if (job.description) {
          blocks.push(
            new Paragraph({
              spacing: { after: 200, line: 320 },
              children: [new TextRun({ text: job.description, font, size: 22, color: muted })],
            }),
          );
        } else {
          blocks.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun(" ")] }));
        }
      }
    }

    if (key === "education" && data.education.length > 0) {
      blocks.push(sectionHeading("Education", accent, font));
      for (const edu of data.education) {
        blocks.push(
          new Paragraph({
            spacing: { after: 40 },
            tabStops: [{ type: "right", position: 9000 }],
            children: [
              new TextRun({ text: edu.degree, bold: true, font, size: 24, color: body }),
              new TextRun({ text: edu.institution ? `  ·  ${edu.institution}` : "", font, size: 22, color: muted }),
              new TextRun({ text: "\t", font, size: 22 }),
              new TextRun({
                text: `${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ""}`,
                font,
                size: 20,
                color: subtle,
              }),
            ],
          }),
        );
        if (edu.description) {
          blocks.push(
            new Paragraph({
              spacing: { after: 200, line: 320 },
              children: [new TextRun({ text: edu.description, font, size: 22, color: muted })],
            }),
          );
        } else {
          blocks.push(new Paragraph({ spacing: { after: 120 }, children: [new TextRun(" ")] }));
        }
      }
    }

    if (key === "skills" && data.skills.length > 0) {
      blocks.push(sectionHeading("Skills", accent, font));
      blocks.push(
        new Paragraph({
          spacing: { after: 200, line: 320 },
          children: [
            new TextRun({
              text: data.skills.join("  ·  "),
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
        document: {
          run: { font, size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
          },
        },
        children: blocks,
      },
    ],
  });
}
