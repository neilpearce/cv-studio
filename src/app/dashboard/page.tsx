import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?callbackUrl=/dashboard");

  const [cvs, coverLetters] = await Promise.all([
    prisma.cV.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, template: true, updatedAt: true, createdAt: true },
    }),
    prisma.coverLetter.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, template: true, updatedAt: true, createdAt: true },
    }),
  ]);

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/signin" });
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b bg-background">
        <div className="container flex h-14 items-center gap-3">
          <Link href="/dashboard" className="text-base font-semibold">
            CV Studio
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {session.user.email}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <form action={signOutAction}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container py-10">
        <DashboardClient
          initialCvs={cvs.map((c) => ({
            id: c.id,
            name: c.name,
            template: c.template,
            updatedAt: c.updatedAt.toISOString(),
            createdAt: c.createdAt.toISOString(),
          }))}
          initialCoverLetters={coverLetters.map((c) => ({
            id: c.id,
            name: c.name,
            template: c.template,
            updatedAt: c.updatedAt.toISOString(),
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </main>
    </div>
  );
}
