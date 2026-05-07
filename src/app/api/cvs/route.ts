import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultCV } from "@/lib/default-cv";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cvs = await prisma.cV.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, template: true, updatedAt: true, createdAt: true },
  });

  return NextResponse.json({ cvs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled CV";
  const template = body.template === "minimal" ? "minimal" : "modern";

  const cv = await prisma.cV.create({
    data: {
      userId: session.user.id,
      name,
      template,
      data: JSON.stringify(defaultCV()),
    },
    select: { id: true },
  });

  return NextResponse.json({ id: cv.id });
}
