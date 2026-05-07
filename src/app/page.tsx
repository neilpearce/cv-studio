import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container flex h-14 items-center justify-between">
        <span className="font-semibold">CV Studio</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <main className="container flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          A modern editor for the CVs you actually want to send.
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Live preview, drag-and-drop sections, two clean templates, and PDF export. Your data is
          saved as structured JSON so you can come back and edit anytime.
        </p>
        <div className="flex gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Create your CV</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signin">I have an account</Link>
          </Button>
        </div>
      </main>

      <footer className="container py-8 text-center text-xs text-muted-foreground">
        Built with Next.js, Prisma, and Tailwind.
      </footer>
    </div>
  );
}
