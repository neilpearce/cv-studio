import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const original = await prisma.coverLetter.findUnique({ where: { id } });
  if (!original || original.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const copy = await prisma.coverLetter.create({
    data: {
      userId: session.user.id,
      name: `${original.name} (Copy)`,
      template: original.template,
      data: original.data,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: copy.id });
}
