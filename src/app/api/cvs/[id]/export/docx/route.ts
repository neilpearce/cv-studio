import { NextResponse } from "next/server";
import { Packer } from "docx";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cvDataSchema, type TemplateId } from "@/lib/cv-types";
import { defaultCV } from "@/lib/default-cv";
import { buildDocx } from "@/components/templates-docx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cv = await prisma.cV.findUnique({ where: { id } });
  if (!cv || cv.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = cvDataSchema.safeParse(JSON.parse(cv.data));
  const data = parsed.success ? parsed.data : defaultCV();
  const template: TemplateId = cv.template === "minimal" ? "minimal" : "modern";

  try {
    const doc = buildDocx(template, data);
    const buffer = await Packer.toBuffer(doc);
    const filename = `${cv.name.replace(/[^a-z0-9-_ ]/gi, "_") || "resume"}.docx`;
    const ab = new ArrayBuffer(buffer.byteLength);
    new Uint8Array(ab).set(buffer);
    return new NextResponse(ab, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("DOCX export failed:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
