import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultCoverLetter } from "@/lib/default-cover-letter";
import { cvDataSchema } from "@/lib/cv-types";
import { COVER_LETTER_TEMPLATE_IDS } from "@/lib/cover-letter-types";

const createSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  template: z.enum(COVER_LETTER_TEMPLATE_IDS).optional(),
  cvId: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.coverLetter.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, template: true, updatedAt: true, createdAt: true },
  });
  return NextResponse.json({ coverLetters: items });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = defaultCoverLetter();

  // Optionally inherit sender info from a CV
  if (parsed.data.cvId) {
    const cv = await prisma.cV.findUnique({ where: { id: parsed.data.cvId } });
    if (cv && cv.userId === session.user.id) {
      const cvData = cvDataSchema.safeParse(JSON.parse(cv.data));
      if (cvData.success) {
        data.sender = {
          fullName: cvData.data.personal.fullName || data.sender.fullName,
          email: cvData.data.personal.email || data.sender.email,
          phone: cvData.data.personal.phone || data.sender.phone,
          location: cvData.data.personal.location || data.sender.location,
          website: cvData.data.personal.website || data.sender.website,
        };
        data.signature = cvData.data.personal.fullName || data.signature;
      }
    }
  }

  const created = await prisma.coverLetter.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name?.trim() || "Untitled cover letter",
      template: parsed.data.template ?? "modern",
      data: JSON.stringify(data),
    },
    select: { id: true },
  });

  return NextResponse.json({ id: created.id });
}
