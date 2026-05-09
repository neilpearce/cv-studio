"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileText,
  Redo2,
  Undo2,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeControls } from "@/components/editor/ThemeControls";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useAutosave } from "@/hooks/useAutosave";
import type { CoverLetterData } from "@/lib/cover-letter-types";
import { renderCoverLetter } from "@/components/cover-letter-templates";
import { BodyEditor } from "./BodyEditor";

interface InitialCoverLetter {
  id: string;
  name: string;
  template: string;
  data: CoverLetterData;
}

export function CoverLetterEditor({ initial }: { initial: InitialCoverLetter }) {
  const { state, set, undo, redo, canUndo, canRedo } =
    useUndoRedo<CoverLetterData>(initial.data);
  const [name, setName] = React.useState(initial.name);
  const [exporting, setExporting] = React.useState(false);

  const persistPayload = React.useMemo(
    () => ({ name, template: "modern", data: state }),
    [name, state],
  );

  const status = useAutosave(persistPayload, async (value) => {
    const res = await fetch(`/api/cover-letters/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) throw new Error("Save failed");
  });

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  async function exportFile(format: "pdf" | "docx") {
    setExporting(true);
    try {
      const res = await fetch(`/api/cover-letters/${initial.id}/export/${format}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "cover-letter"}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error(`Could not export ${format.toUpperCase()}`);
    } finally {
      setExporting(false);
    }
  }

  const update = <K extends keyof CoverLetterData>(key: K, value: CoverLetterData[K]) =>
    set({ ...state, [key]: value });

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Input
          aria-label="Cover letter name"
          className="h-9 max-w-xs"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <SaveIndicator status={status} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Export</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => exportFile("pdf")}>
                <FileText className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportFile("docx")}>
                <FileText className="h-4 w-4" />
                Export as Word (.docx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[420px] shrink-0 overflow-y-auto border-r bg-background">
          <div className="space-y-4 p-4">
            <ThemeControls
              theme={state.theme}
              onChange={(theme) => update("theme", theme)}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Sender</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Full name">
                  <Input
                    value={state.sender.fullName}
                    onChange={(e) =>
                      update("sender", { ...state.sender, fullName: e.target.value })
                    }
                  />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Email">
                    <Input
                      value={state.sender.email}
                      onChange={(e) =>
                        update("sender", { ...state.sender, email: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={state.sender.phone}
                      onChange={(e) =>
                        update("sender", { ...state.sender, phone: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Location">
                    <Input
                      value={state.sender.location}
                      onChange={(e) =>
                        update("sender", { ...state.sender, location: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Website">
                    <Input
                      value={state.sender.website}
                      onChange={(e) =>
                        update("sender", { ...state.sender, website: e.target.value })
                      }
                    />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Recipient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Name">
                  <Input
                    value={state.recipient.name}
                    onChange={(e) =>
                      update("recipient", { ...state.recipient, name: e.target.value })
                    }
                    placeholder="Hiring Team / Sarah Smith"
                  />
                </Field>
                <Field label="Title">
                  <Input
                    value={state.recipient.title}
                    onChange={(e) =>
                      update("recipient", { ...state.recipient, title: e.target.value })
                    }
                    placeholder="Head of Design (optional)"
                  />
                </Field>
                <Field label="Company">
                  <Input
                    value={state.recipient.company}
                    onChange={(e) =>
                      update("recipient", { ...state.recipient, company: e.target.value })
                    }
                  />
                </Field>
                <Field label="Address (optional, multi-line)">
                  <Textarea
                    rows={3}
                    value={state.recipient.address}
                    onChange={(e) =>
                      update("recipient", { ...state.recipient, address: e.target.value })
                    }
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Letter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Date">
                  <Input
                    value={state.date}
                    onChange={(e) => update("date", e.target.value)}
                  />
                </Field>
                <Field label="Subject (optional)">
                  <Input
                    value={state.subject}
                    onChange={(e) => update("subject", e.target.value)}
                  />
                </Field>
                <Field label="Greeting">
                  <Input
                    value={state.greeting}
                    onChange={(e) => update("greeting", e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>

            <BodyEditor
              paragraphs={state.body}
              onChange={(body) => update("body", body)}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Closing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Field label="Closing">
                  <Input
                    value={state.closing}
                    onChange={(e) => update("closing", e.target.value)}
                  />
                </Field>
                <Field label="Signature">
                  <Input
                    value={state.signature}
                    onChange={(e) => update("signature", e.target.value)}
                  />
                </Field>
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="relative flex-1 overflow-auto">
          <div className="flex min-h-full justify-center p-8">
            <div className="origin-top scale-90 transition">
              {renderCoverLetter("modern", state)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="h-3 w-3" />
        Saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />
        Save failed
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">All changes saved</span>;
}
