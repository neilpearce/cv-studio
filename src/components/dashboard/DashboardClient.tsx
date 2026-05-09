"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, FileText, Mail, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/utils";
import { TEMPLATES } from "@/components/templates";

interface DocSummary {
  id: string;
  name: string;
  template: string;
  updatedAt: string;
  createdAt: string;
}

type DocKind = "cv" | "cover-letter";

export function DashboardClient({
  initialCvs,
  initialCoverLetters,
}: {
  initialCvs: DocSummary[];
  initialCoverLetters: DocSummary[];
}) {
  const router = useRouter();
  const [cvs, setCvs] = React.useState(initialCvs);
  const [coverLetters, setCoverLetters] = React.useState(initialCoverLetters);
  const [creating, setCreating] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<{ kind: DocKind; doc: DocSummary } | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = React.useState<{ kind: DocKind; doc: DocSummary } | null>(
    null,
  );
  const [coverLetterFromCv, setCoverLetterFromCv] = React.useState<{ open: boolean; cvId: string }>(
    { open: false, cvId: "" },
  );

  // ----- CV actions -----
  async function createCv(template: "modern" | "minimal") {
    setCreating(true);
    try {
      const res = await fetch("/api/cvs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, name: "Untitled CV" }),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/cv/${id}`);
    } catch {
      toast.error("Could not create CV");
      setCreating(false);
    }
  }

  async function duplicateCv(cv: DocSummary) {
    const res = await fetch(`/api/cvs/${cv.id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      toast.error("Could not duplicate");
      return;
    }
    const { id } = await res.json();
    router.push(`/cv/${id}`);
  }

  async function renameCv(cv: DocSummary, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/cvs/${cv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) {
      toast.error("Could not rename");
      return;
    }
    setCvs((prev) =>
      prev.map((c) =>
        c.id === cv.id ? { ...c, name: trimmed, updatedAt: new Date().toISOString() } : c,
      ),
    );
    toast.success("Renamed");
  }

  async function removeCv(cv: DocSummary) {
    const res = await fetch(`/api/cvs/${cv.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    setCvs((prev) => prev.filter((c) => c.id !== cv.id));
    toast.success("Deleted");
  }

  // ----- Cover letter actions -----
  async function createCoverLetter(cvId?: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/cover-letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cvId ? { cvId } : {}),
      });
      if (!res.ok) throw new Error();
      const { id } = await res.json();
      router.push(`/cover-letters/${id}`);
    } catch {
      toast.error("Could not create cover letter");
      setCreating(false);
    }
  }

  async function duplicateCoverLetter(cl: DocSummary) {
    const res = await fetch(`/api/cover-letters/${cl.id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      toast.error("Could not duplicate");
      return;
    }
    const { id } = await res.json();
    router.push(`/cover-letters/${id}`);
  }

  async function renameCoverLetter(cl: DocSummary, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/cover-letters/${cl.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) {
      toast.error("Could not rename");
      return;
    }
    setCoverLetters((prev) =>
      prev.map((c) =>
        c.id === cl.id ? { ...c, name: trimmed, updatedAt: new Date().toISOString() } : c,
      ),
    );
    toast.success("Renamed");
  }

  async function removeCoverLetter(cl: DocSummary) {
    const res = await fetch(`/api/cover-letters/${cl.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    setCoverLetters((prev) => prev.filter((c) => c.id !== cl.id));
    toast.success("Deleted");
  }

  return (
    <>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your documents</h1>
          <p className="text-sm text-muted-foreground">
            {cvs.length} {cvs.length === 1 ? "CV" : "CVs"} · {coverLetters.length}{" "}
            {coverLetters.length === 1 ? "cover letter" : "cover letters"}
          </p>
        </div>
      </div>

      <Tabs defaultValue="cvs">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="cvs">CVs</TabsTrigger>
            <TabsTrigger value="cover-letters">Cover letters</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cvs">
          <CvSection
            cvs={cvs}
            creating={creating}
            onCreate={createCv}
            onDuplicate={duplicateCv}
            onRename={(doc) => setRenameTarget({ kind: "cv", doc })}
            onDelete={(doc) => setDeleteTarget({ kind: "cv", doc })}
          />
        </TabsContent>

        <TabsContent value="cover-letters">
          <CoverLetterSection
            coverLetters={coverLetters}
            cvs={cvs}
            creating={creating}
            onCreate={createCoverLetter}
            onCreateFromCv={() =>
              setCoverLetterFromCv({ open: true, cvId: cvs[0]?.id ?? "" })
            }
            onDuplicate={duplicateCoverLetter}
            onRename={(doc) => setRenameTarget({ kind: "cover-letter", doc })}
            onDelete={(doc) => setDeleteTarget({ kind: "cover-letter", doc })}
          />
        </TabsContent>
      </Tabs>

      <RenameDialog
        target={renameTarget?.doc ?? null}
        onClose={() => setRenameTarget(null)}
        onConfirm={async (name) => {
          if (!renameTarget) return;
          if (renameTarget.kind === "cv") await renameCv(renameTarget.doc, name);
          else await renameCoverLetter(renameTarget.doc, name);
          setRenameTarget(null);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.kind === "cover-letter" ? "cover letter" : "CV"}?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.doc.name}&rdquo;. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;
                if (deleteTarget.kind === "cv") await removeCv(deleteTarget.doc);
                else await removeCoverLetter(deleteTarget.doc);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={coverLetterFromCv.open}
        onOpenChange={(o) => setCoverLetterFromCv((s) => ({ ...s, open: o }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start cover letter from a CV</DialogTitle>
            <DialogDescription>
              Pick a CV to copy your name and contact details from.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">CV</Label>
            <Select
              value={coverLetterFromCv.cvId}
              onValueChange={(v) => setCoverLetterFromCv((s) => ({ ...s, cvId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a CV" />
              </SelectTrigger>
              <SelectContent>
                {cvs.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCoverLetterFromCv({ open: false, cvId: "" })}
            >
              Cancel
            </Button>
            <Button
              disabled={!coverLetterFromCv.cvId}
              onClick={() => {
                const cvId = coverLetterFromCv.cvId;
                setCoverLetterFromCv({ open: false, cvId: "" });
                createCoverLetter(cvId);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- CV section ----------

function CvSection({
  cvs,
  creating,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}: {
  cvs: DocSummary[];
  creating: boolean;
  onCreate: (template: "modern" | "minimal") => void;
  onDuplicate: (cv: DocSummary) => void;
  onRename: (cv: DocSummary) => void;
  onDelete: (cv: DocSummary) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "modern" | "minimal">("all");

  const filtered = cvs.filter((c) => {
    if (filter !== "all" && c.template !== filter) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CVs"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All templates</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={creating} className="ml-auto">
              <Plus className="h-4 w-4" />
              New CV
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onCreate("modern")}>
              <FileText className="h-4 w-4" />
              Start with Modern
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onCreate("minimal")}>
              <FileText className="h-4 w-4" />
              Start with Minimal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {cvs.length === 0 ? "No CVs yet. Create your first one." : "No CVs match your filters."}
            </p>
            {cvs.length === 0 ? (
              <Button onClick={() => onCreate("modern")}>
                <Plus className="h-4 w-4" />
                Create your first CV
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cv) => (
            <DocumentCard
              key={cv.id}
              doc={cv}
              href={`/cv/${cv.id}`}
              templateLabel={
                TEMPLATES[cv.template as keyof typeof TEMPLATES]?.name ?? cv.template
              }
              icon={<FileText className="h-12 w-12 text-muted-foreground/40" />}
              onDuplicate={() => onDuplicate(cv)}
              onRename={() => onRename(cv)}
              onDelete={() => onDelete(cv)}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ---------- Cover letter section ----------

function CoverLetterSection({
  coverLetters,
  cvs,
  creating,
  onCreate,
  onCreateFromCv,
  onDuplicate,
  onRename,
  onDelete,
}: {
  coverLetters: DocSummary[];
  cvs: DocSummary[];
  creating: boolean;
  onCreate: () => void;
  onCreateFromCv: () => void;
  onDuplicate: (cl: DocSummary) => void;
  onRename: (cl: DocSummary) => void;
  onDelete: (cl: DocSummary) => void;
}) {
  const [query, setQuery] = React.useState("");

  const filtered = coverLetters.filter((c) =>
    query ? c.name.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cover letters"
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={creating} className="ml-auto">
              <Plus className="h-4 w-4" />
              New cover letter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onCreate()}>
              <Mail className="h-4 w-4" />
              Blank
            </DropdownMenuItem>
            {cvs.length > 0 ? (
              <DropdownMenuItem onSelect={onCreateFromCv}>
                <FileText className="h-4 w-4" />
                Pre-fill from a CV…
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Mail className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {coverLetters.length === 0
                ? "No cover letters yet."
                : "No cover letters match your search."}
            </p>
            {coverLetters.length === 0 ? (
              <Button onClick={() => onCreate()}>
                <Plus className="h-4 w-4" />
                Create your first cover letter
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cl) => (
            <DocumentCard
              key={cl.id}
              doc={cl}
              href={`/cover-letters/${cl.id}`}
              templateLabel="Cover letter"
              icon={<Mail className="h-12 w-12 text-muted-foreground/40" />}
              onDuplicate={() => onDuplicate(cl)}
              onRename={() => onRename(cl)}
              onDelete={() => onDelete(cl)}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ---------- Shared card ----------

function DocumentCard({
  doc,
  href,
  templateLabel,
  icon,
  onDuplicate,
  onRename,
  onDelete,
}: {
  doc: DocSummary;
  href: string;
  templateLabel: string;
  icon: React.ReactNode;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="group transition hover:shadow-md">
      <Link href={href} className="block">
        <div className="flex aspect-[1/1.4] items-center justify-center rounded-t-lg border-b bg-gradient-to-br from-muted to-muted-foreground/10">
          {icon}
        </div>
      </Link>
      <CardContent className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link href={href} className="block truncate font-medium hover:underline">
            {doc.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {templateLabel} · {formatRelativeTime(new Date(doc.updatedAt))}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onRename}>Rename</DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}

function RenameDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: DocSummary | null;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    if (target) setValue(target.name);
  }, [target]);
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="rename-input">Name</Label>
          <Input
            id="rename-input"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onConfirm(value);
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(value)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
