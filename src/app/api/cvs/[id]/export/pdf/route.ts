import { NextResponse } from "next/server";
import type { Browser } from "puppeteer-core";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
    }) as unknown as Browser;
  }

  // Local dev: full puppeteer ships its own Chromium
  const puppeteer = await import("puppeteer");
  return puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }) as unknown as Browser;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const cv = await prisma.cV.findUnique({ where: { id } });
  if (!cv || cv.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const origin = new URL(req.url).origin;
  const cookieHeader = req.headers.get("cookie") ?? "";

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);

    if (cookieHeader) {
      const cookies = cookieHeader
        .split(";")
        .map((c) => {
          const [name, ...rest] = c.trim().split("=");
          return { name, value: rest.join("="), url: origin };
        })
        .filter((c) => c.name);
      try {
        await page.setCookie(...cookies);
      } catch {
        // ignore malformed cookies
      }
    }

    await page.goto(`${origin}/cv/${id}/print`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.emulateMediaType("print");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    const filename = `${cv.name.replace(/[^a-z0-9-_ ]/gi, "_") || "resume"}.pdf`;
    const ab = new ArrayBuffer(pdf.byteLength);
    new Uint8Array(ab).set(pdf);
    return new NextResponse(ab, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("PDF export failed:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  } finally {
    await browser.close();
  }
}
