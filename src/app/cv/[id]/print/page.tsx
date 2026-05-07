import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cvDataSchema, type TemplateId } from "@/lib/cv-types";
import { defaultCV } from "@/lib/default-cv";
import { renderTemplate } from "@/components/templates";

export const dynamic = "force-dynamic";

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const { id } = await params;
  const cv = await prisma.cV.findUnique({ where: { id } });
  if (!cv || cv.userId !== session.user.id) notFound();

  const parsed = cvDataSchema.safeParse(JSON.parse(cv.data));
  const data = parsed.success ? parsed.data : defaultCV();
  const template = (cv.template === "minimal" ? "minimal" : "modern") as TemplateId;

  return (
    <div className="bg-white">
      {renderTemplate(template, data)}
    </div>
  );
}
