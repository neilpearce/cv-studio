import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cvDataSchema, TEMPLATE_IDS } from "@/lib/cv-types";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  template: z.enum(TEMPLATE_IDS).optional(),
  data: cvDataSchema.optional(),
});

async function requireOwner(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const cv = await prisma.cV.findUnique({ where: { id } });
  if (!cv || cv.userId !== session.user.id) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { cv, userId: session.user.id };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOwner(id);
  if ("error" in result) return result.error;
  const { cv } = result;
  return NextResponse.json({
    cv: {
      id: cv.id,
      name: cv.name,
      template: cv.template,
      data: JSON.parse(cv.data),
      updatedAt: cv.updatedAt,
      createdAt: cv.createdAt,
    },
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOwner(id);
  if ("error" in result) return result.error;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await prisma.cV.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.template !== undefined && { template: parsed.data.template }),
      ...(parsed.data.data !== undefined && { data: JSON.stringify(parsed.data.data) }),
    },
    select: { id: true, updatedAt: true },
  });

  return NextResponse.json({ cv: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOwner(id);
  if ("error" in result) return result.error;

  await prisma.cV.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
