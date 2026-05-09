import { NextResponse } from "next/server";
import { Packer } from "docx";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  coverLetterDataSchema,
  type CoverLetterTemplateId,
} from "@/lib/cover-letter-types";
import { defaultCoverLetter } from "@/lib/default-cover-letter";
import { buildCoverLetterDocx } from "@/components/cover-letter-templates-docx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.coverLetter.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = coverLetterDataSchema.safeParse(JSON.parse(item.data));
  const data = parsed.success ? parsed.data : defaultCoverLetter();
  const template: CoverLetterTemplateId = "modern";

  try {
    const doc = buildCoverLetterDocx(template, data);
    const buffer = await Packer.toBuffer(doc);
    const filename = `${item.name.replace(/[^a-z0-9-_ ]/gi, "_") || "cover-letter"}.docx`;
    const ab = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(ab).set(buffer);
    return new NextResponse(ab, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Cover letter DOCX export failed:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
