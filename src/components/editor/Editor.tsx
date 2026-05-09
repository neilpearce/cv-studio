"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Download, FileText, Redo2, Undo2, Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useAutosave } from "@/hooks/useAutosave";
import {
  type CVData,
  type SectionKey,
  SECTION_KEYS,
  TEMPLATE_IDS,
  type TemplateId,
} from "@/lib/cv-types";
import { renderTemplate } from "@/components/templates";
import { SectionEditor } from "./SectionEditor";
import { PersonalForm } from "./PersonalForm";
import { TemplatePicker } from "./TemplatePicker";
import { ThemeControls } from "./ThemeControls";

interface InitialCV {
  id: string;
  name: string;
  template: string;
  data: CVData;
}

export function Editor({ initial }: { initial: InitialCV }) {
  const { state, set, undo, redo, canUndo, canRedo } = useUndoRedo<CVData>(initial.data);
  const [name, setName] = React.useState(initial.name);
  const [template, setTemplate] = React.useState<TemplateId>(
    (TEMPLATE_IDS as readonly string[]).includes(initial.template)
      ? (initial.template as TemplateId)
      : "modern",
  );
  const [exporting, setExporting] = React.useState(false);

  const persistPayload = React.useMemo(
    () => ({ name, template, data: state }),
    [name, template, state],
  );

  const status = useAutosave(persistPayload, async (value) => {
    const res = await fetch(`/api/cvs/${initial.id}`, {
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = state.sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = state.sectionOrder.indexOf(over.id as SectionKey);
    if (oldIndex < 0 || newIndex < 0) return;
    set({ ...state, sectionOrder: arrayMove(state.sectionOrder, oldIndex, newIndex) });
  }

  async function exportFile(format: "pdf" | "docx") {
    setExporting(true);
    try {
      const res = await fetch(`/api/cvs/${initial.id}/export/${format}`, { method: "POST" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name || "resume"}.${format}`;
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

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Input
          aria-label="CV name"
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
            <TemplatePicker value={template} onChange={setTemplate} />
            <ThemeControls
              theme={state.theme}
              onChange={(theme) => set({ ...state, theme })}
            />
            <PersonalForm
              value={state.personal}
              onChange={(personal) => set({ ...state, personal })}
            />

            <div>
              <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sections
              </p>
              <p className="mb-2 px-1 text-xs text-muted-foreground">
                Drag to reorder. Edit fields inline.
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={state.sectionOrder} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {state.sectionOrder.map((key) => (
                      <SectionEditor
                        key={key}
                        sectionKey={key}
                        data={state}
                        onChange={(next) => set(next)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              <SectionAdder
                order={state.sectionOrder}
                onAdd={(key) => set({ ...state, sectionOrder: [...state.sectionOrder, key] })}
              />
            </div>
          </div>
        </aside>

        <main className="relative flex-1 overflow-auto">
          <div className="flex min-h-full justify-center p-8">
            <div className="origin-top scale-90 transition">
              {renderTemplate(template, state)}
            </div>
          </div>
        </main>
      </div>
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

function SectionAdder({
  order,
  onAdd,
}: {
  order: SectionKey[];
  onAdd: (key: SectionKey) => void;
}) {
  const missing = SECTION_KEYS.filter((k) => !order.includes(k));
  if (missing.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {missing.map((key) => (
        <Button key={key} variant="outline" size="sm" onClick={() => onAdd(key)}>
          + {labelFor(key)}
        </Button>
      ))}
    </div>
  );
}

function labelFor(key: SectionKey) {
  return { profile: "Profile", experience: "Experience", education: "Education", skills: "Skills" }[key];
}
