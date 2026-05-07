import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cvDataSchema, type TemplateId } from "@/lib/cv-types";
import { defaultCV } from "@/lib/default-cv";
import { renderPdf } from "@/components/templates-pdf";

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
    const pdfBuffer = await renderToBuffer(renderPdf(template, data));
    const filename = `${cv.name.replace(/[^a-z0-9-_ ]/gi, "_") || "resume"}.pdf`;
    const ab = new ArrayBuffer(pdfBuffer.byteLength);
    new Uint8Array(ab).set(pdfBuffer);
    return new NextResponse(ab, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF export failed:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
