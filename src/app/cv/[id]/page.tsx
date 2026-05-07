import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cvDataSchema } from "@/lib/cv-types";
import { defaultCV } from "@/lib/default-cv";
import { Editor } from "@/components/editor/Editor";

export const dynamic = "force-dynamic";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/dashboard");

  const { id } = await params;
  const cv = await prisma.cV.findUnique({ where: { id } });
  if (!cv || cv.userId !== session.user.id) notFound();

  let parsed = cvDataSchema.safeParse(JSON.parse(cv.data));
  if (!parsed.success) {
    parsed = cvDataSchema.safeParse(defaultCV());
  }

  return (
    <Editor
      initial={{
        id: cv.id,
        name: cv.name,
        template: cv.template,
        data: parsed.success ? parsed.data : defaultCV(),
      }}
    />
  );
}
