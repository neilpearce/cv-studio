import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Decorative dotted grid (top-left) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-24 hidden h-48 w-96 opacity-50 lg:block"
        style={{
          backgroundImage:
            "radial-gradient(hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <header className="container relative z-10 flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tight">
          CV Studio
        </Link>
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

      <main className="container relative z-10 flex-1">
        <div className="grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              Online CV Builder
            </p>
            <h1 className="text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Job winning{" "}
              <Underlined>CV</Underlined>
              <br className="hidden sm:block" />
              {" "}and <Underlined>Cover letter</Underlined> for you
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Do you invest a lot of time in creating and maintaining your CV?
              Build a hosted, editable CV you can edit, download, and share —
              instantly, for free.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="h-12 gap-2 px-6 text-base" asChild>
                <Link href="/signup">
                  Create CV
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" className="h-12 px-4 text-base" asChild>
                <Link href="/signin">I already have an account</Link>
              </Button>
            </div>
          </div>

          <HeroVisual />
        </div>
      </main>

      <footer className="container relative z-10 py-8 text-center text-xs text-muted-foreground">
        Built with Next.js, Prisma, and Tailwind.
      </footer>
    </div>
  );
}

function Underlined({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        className="absolute -bottom-2 left-0 h-3 w-full text-primary"
        viewBox="0 0 100 8"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 5 Q 25 1 50 4 T 100 4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md sm:max-w-lg">
      {/* Concentric blue backdrop circles */}
      <div className="absolute inset-[2%] rounded-full bg-primary/20" />
      <div className="absolute inset-[14%] rounded-full bg-primary/15" />
      <div className="absolute inset-[26%] rounded-full bg-primary/10" />

      {/* Floating CV mock — back */}
      <CvMock
        className="absolute right-[2%] top-[8%] w-[48%] rotate-[8deg] shadow-2xl"
        sidebar
      />
      {/* Floating CV mock — front */}
      <CvMock
        className="absolute left-[4%] top-[20%] w-[58%] -rotate-[6deg] shadow-2xl"
        showPhoto
      />
    </div>
  );
}

function CvMock({
  className,
  showPhoto = false,
  sidebar = false,
}: {
  className?: string;
  showPhoto?: boolean;
  sidebar?: boolean;
}) {
  const accent = "#244CEC";
  return (
    <div
      className={`overflow-hidden rounded-md bg-white ring-1 ring-black/5 ${className ?? ""}`}
      style={{ aspectRatio: "210 / 297" }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 p-3">
        {showPhoto && (
          <div
            className="h-6 w-6 shrink-0 rounded-full"
            style={{ background: "#dbeafe" }}
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[8px] font-bold leading-tight text-slate-900">
            {sidebar ? "Jessica Claire" : "Jason Miller"}
          </div>
          <div className="text-[5px]" style={{ color: accent }}>
            {sidebar ? "Product Designer" : "UX Designer"}
          </div>
        </div>
      </div>

      {/* Body — either sidebar layout or single column */}
      {sidebar ? (
        <div className="grid grid-cols-[35%_1fr] gap-1.5 px-2.5">
          <div
            className="space-y-1 rounded-sm p-1.5"
            style={{ background: "#eef2ff" }}
          >
            <BarBlock label="Skills" accent={accent} count={3} />
            <BarBlock label="Education" accent={accent} count={2} />
            <BarBlock label="Contact" accent={accent} count={2} />
          </div>
          <div className="space-y-1.5">
            <BarBlock label="Profile" accent={accent} count={3} />
            <BarBlock label="Experience" accent={accent} count={4} />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 px-3">
          <BarBlock label="Profile" accent={accent} count={3} />
          <BarBlock label="Experience" accent={accent} count={4} />
          <BarBlock label="Education" accent={accent} count={2} />
        </div>
      )}
    </div>
  );
}

function BarBlock({
  label,
  accent,
  count,
}: {
  label: string;
  accent: string;
  count: number;
}) {
  return (
    <div>
      <div
        className="text-[5px] font-bold uppercase tracking-wider"
        style={{ color: accent }}
      >
        {label}
      </div>
      <div
        className="mt-0.5 mb-1 h-0.5 rounded-full"
        style={{ background: accent, opacity: 0.4 }}
      />
      <div className="space-y-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded bg-slate-100"
            style={{ width: `${100 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}
