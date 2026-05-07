"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, FileText, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
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
import { formatRelativeTime } from "@/lib/utils";
import { TEMPLATES } from "@/components/templates";

interface CvSummary {
  id: string;
  name: string;
  template: string;
  updatedAt: string;
  createdAt: string;
}

export function DashboardClient({ initialCvs }: { initialCvs: CvSummary[] }) {
  const router = useRouter();
  const [cvs, setCvs] = React.useState(initialCvs);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "modern" | "minimal">("all");
  const [creating, setCreating] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<CvSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CvSummary | null>(null);

  const filtered = cvs.filter((c) => {
    if (filter !== "all" && c.template !== filter) return false;
    if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  async function createNew(template: "modern" | "minimal") {
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

  async function duplicate(cv: CvSummary) {
    const res = await fetch(`/api/cvs/${cv.id}/duplicate`, { method: "POST" });
    if (!res.ok) {
      toast.error("Could not duplicate");
      return;
    }
    const { id } = await res.json();
    router.push(`/cv/${id}`);
  }

  async function rename(cv: CvSummary, name: string) {
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
      prev.map((c) => (c.id === cv.id ? { ...c, name: trimmed, updatedAt: new Date().toISOString() } : c)),
    );
    toast.success("Renamed");
  }

  async function remove(cv: CvSummary) {
    const res = await fetch(`/api/cvs/${cv.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    setCvs((prev) => prev.filter((c) => c.id !== cv.id));
    toast.success("Deleted");
  }

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your CVs</h1>
          <p className="text-sm text-muted-foreground">
            {cvs.length} {cvs.length === 1 ? "document" : "documents"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button disabled={creating}>
              <Plus className="h-4 w-4" />
              New CV
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => createNew("modern")}>
              <FileText className="h-4 w-4" />
              Start with Modern
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => createNew("minimal")}>
              <FileText className="h-4 w-4" />
              Start with Minimal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {cvs.length === 0 ? "No CVs yet. Create your first one." : "No CVs match your filters."}
            </p>
            {cvs.length === 0 ? (
              <Button onClick={() => createNew("modern")}>
                <Plus className="h-4 w-4" />
                Create your first CV
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((cv) => (
            <Card key={cv.id} className="group transition hover:shadow-md">
              <Link href={`/cv/${cv.id}`} className="block">
                <div className="flex aspect-[1/1.4] items-center justify-center rounded-t-lg border-b bg-gradient-to-br from-muted to-muted-foreground/10">
                  <FileText className="h-12 w-12 text-muted-foreground/40" />
                </div>
              </Link>
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <Link href={`/cv/${cv.id}`} className="block truncate font-medium hover:underline">
                    {cv.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {TEMPLATES[cv.template as keyof typeof TEMPLATES]?.name ?? cv.template} ·{" "}
                    {formatRelativeTime(new Date(cv.updatedAt))}
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
                    <DropdownMenuItem onSelect={() => setRenameTarget(cv)}>Rename</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => duplicate(cv)}>
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setDeleteTarget(cv)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <RenameDialog
        target={renameTarget}
        onClose={() => setRenameTarget(null)}
        onConfirm={async (name) => {
          if (renameTarget) await rename(renameTarget, name);
          setRenameTarget(null);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete CV?</DialogTitle>
            <DialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.name}&rdquo;. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteTarget) await remove(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RenameDialog({
  target,
  onClose,
  onConfirm,
}: {
  target: CvSummary | null;
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
          <DialogTitle>Rename CV</DialogTitle>
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
