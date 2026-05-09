import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  COVER_LETTER_TEMPLATE_IDS,
  coverLetterDataSchema,
} from "@/lib/cover-letter-types";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  template: z.enum(COVER_LETTER_TEMPLATE_IDS).optional(),
  data: coverLetterDataSchema.optional(),
});

async function requireOwner(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const item = await prisma.coverLetter.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  return { item, userId: session.user.id };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOwner(id);
  if ("error" in result) return result.error;
  const { item } = result;
  return NextResponse.json({
    coverLetter: {
      id: item.id,
      name: item.name,
      template: item.template,
      data: JSON.parse(item.data),
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
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
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.coverLetter.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.template !== undefined && { template: parsed.data.template }),
      ...(parsed.data.data !== undefined && { data: JSON.stringify(parsed.data.data) }),
    },
    select: { id: true, updatedAt: true },
  });
  return NextResponse.json({ coverLetter: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireOwner(id);
  if ("error" in result) return result.error;
  await prisma.coverLetter.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
