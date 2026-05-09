import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coverLetterDataSchema } from "@/lib/cover-letter-types";
import { defaultCoverLetter } from "@/lib/default-cover-letter";
import { CoverLetterEditor } from "@/components/cover-letter-editor/CoverLetterEditor";

export const dynamic = "force-dynamic";

export default async function CoverLetterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/dashboard");

  const { id } = await params;
  const item = await prisma.coverLetter.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) notFound();

  const parsed = coverLetterDataSchema.safeParse(JSON.parse(item.data));

  return (
    <CoverLetterEditor
      initial={{
        id: item.id,
        name: item.name,
        template: item.template,
        data: parsed.success ? parsed.data : defaultCoverLetter(),
      }}
    />
  );
}
