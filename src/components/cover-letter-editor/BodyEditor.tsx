"use client";

import * as React from "react";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { uid } from "@/lib/default-cv";
import type { Paragraph } from "@/lib/cover-letter-types";
import { cn } from "@/lib/utils";

export function BodyEditor({
  paragraphs,
  onChange,
}: {
  paragraphs: Paragraph[];
  onChange: (next: Paragraph[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = paragraphs.findIndex((p) => p.id === active.id);
    const newIndex = paragraphs.findIndex((p) => p.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(paragraphs, oldIndex, newIndex));
  }

  function addParagraph() {
    onChange([...paragraphs, { id: uid(), text: "" }]);
  }

  function update(id: string, text: string) {
    onChange(paragraphs.map((p) => (p.id === id ? { ...p, text } : p)));
  }

  function remove(id: string) {
    onChange(paragraphs.filter((p) => p.id !== id));
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Body</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Each block is one paragraph. Drag to reorder.
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={paragraphs.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {paragraphs.map((p) => (
                <ParagraphRow
                  key={p.id}
                  paragraph={p}
                  onChange={(text) => update(p.id, text)}
                  onRemove={() => remove(p.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button variant="outline" size="sm" onClick={addParagraph} className="w-full">
          <Plus className="h-3.5 w-3.5" /> Add paragraph
        </Button>
      </CardContent>
    </Card>
  );
}

function ParagraphRow({
  paragraph,
  onChange,
  onRemove,
}: {
  paragraph: Paragraph;
  onChange: (text: string) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: paragraph.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-md border bg-muted/30 p-2 transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/50",
      )}
    >
      <div className="mb-1 flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          aria-label="Reorder paragraph"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7"
          onClick={onRemove}
          aria-label="Remove paragraph"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Textarea
        rows={4}
        value={paragraph.text}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
