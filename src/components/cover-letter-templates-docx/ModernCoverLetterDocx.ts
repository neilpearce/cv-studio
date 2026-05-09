import { Document, Paragraph, TextRun, BorderStyle } from "docx";
import type { CoverLetterData } from "@/lib/cover-letter-types";
import { FONT_MAP, hexNoHash } from "@/components/templates-docx/shared";

export function buildModernCoverLetterDocx(data: CoverLetterData): Document {
  const accent = hexNoHash(data.theme.accentColor);
  const font = FONT_MAP[data.theme.fontFamily];
  const muted = "374151";
  const subtle = "6B7280";
  const body = "111111";

  const blocks: Paragraph[] = [];

  // Header — sender block
  blocks.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: data.sender.fullName || "Your Name",
          bold: true,
          font,
          size: 36,
          color: accent,
        }),
      ],
    }),
  );

  const meta = [
    data.sender.email,
    data.sender.phone,
    data.sender.location,
    data.sender.website,
  ].filter(Boolean);

  if (meta.length > 0) {
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
            text: meta.join("    "),
            font,
            size: 18,
            color: subtle,
          }),
        ],
      }),
    );
  }

  if (data.date) {
    blocks.push(
      new Paragraph({
        spacing: { after: 280 },
        children: [new TextRun({ text: data.date, font, size: 22, color: muted })],
      }),
    );
  }

  const recipientLines: string[] = [];
  if (data.recipient.name) recipientLines.push(data.recipient.name);
  if (data.recipient.title) recipientLines.push(data.recipient.title);
  if (data.recipient.company) recipientLines.push(data.recipient.company);
  if (data.recipient.address) {
    for (const line of data.recipient.address.split("\n")) {
      if (line.trim()) recipientLines.push(line);
    }
  }
  for (let i = 0; i < recipientLines.length; i++) {
    blocks.push(
      new Paragraph({
        spacing: { after: i === recipientLines.length - 1 ? 280 : 40 },
        children: [
          new TextRun({ text: recipientLines[i], font, size: 22, color: muted }),
        ],
      }),
    );
  }

  if (data.subject) {
    blocks.push(
      new Paragraph({
        spacing: { after: 280 },
        children: [
          new TextRun({ text: data.subject, bold: true, font, size: 24, color: body }),
        ],
      }),
    );
  }

  if (data.greeting) {
    blocks.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: data.greeting, font, size: 22, color: body })],
      }),
    );
  }

  for (const p of data.body) {
    blocks.push(
      new Paragraph({
        spacing: { after: 200, line: 320 },
        children: [new TextRun({ text: p.text, font, size: 22, color: muted })],
      }),
    );
  }

  if (data.closing) {
    blocks.push(
      new Paragraph({
        spacing: { before: 200, after: 40 },
        children: [new TextRun({ text: data.closing, font, size: 22, color: body })],
      }),
    );
  }

  if (data.signature) {
    blocks.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.signature, bold: true, font, size: 24, color: body }),
        ],
      }),
    );
  }

  return new Document({
    creator: "CV Studio",
    title: data.sender.fullName ? `${data.sender.fullName} – Cover letter` : "Cover letter",
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
