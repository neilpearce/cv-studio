"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { uid } from "@/lib/default-cv";
import { SECTION_TITLES, type CVData, type EducationItem, type ExperienceItem, type SectionKey } from "@/lib/cv-types";
import { cn } from "@/lib/utils";

export function SectionEditor({
  sectionKey,
  data,
  onChange,
}: {
  sectionKey: SectionKey;
  data: CVData;
  onChange: (next: CVData) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sectionKey,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const remove = () =>
    onChange({ ...data, sectionOrder: data.sectionOrder.filter((k) => k !== sectionKey) });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "overflow-hidden transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/50",
      )}
    >
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Reorder section"
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{SECTION_TITLES[sectionKey]}</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-7 w-7"
          aria-label="Hide section"
          onClick={remove}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-3 pt-0">
        {sectionKey === "profile" && (
          <ProfileFields value={data.profile} onChange={(profile) => onChange({ ...data, profile })} />
        )}
        {sectionKey === "experience" && (
          <ExperienceFields
            items={data.experience}
            onChange={(experience) => onChange({ ...data, experience })}
          />
        )}
        {sectionKey === "education" && (
          <EducationFields
            items={data.education}
            onChange={(education) => onChange({ ...data, education })}
          />
        )}
        {sectionKey === "skills" && (
          <SkillsFields skills={data.skills} onChange={(skills) => onChange({ ...data, skills })} />
        )}
      </CardContent>
    </Card>
  );
}

function ProfileFields({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">Summary</Label>
      <Textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ExperienceFields({
  items,
  onChange,
}: {
  items: ExperienceItem[];
  onChange: (next: ExperienceItem[]) => void;
}) {
  function update(id: string, patch: Partial<ExperienceItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }
  function add() {
    onChange([
      ...items,
      { id: uid(), title: "", company: "", startDate: "", endDate: "", description: "" },
    ]);
  }
  return (
    <div className="space-y-3">
      {items.map((job) => (
        <div key={job.id} className="rounded-md border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Role</Label>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              aria-label="Remove role"
              onClick={() => remove(job.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input value={job.title} onChange={(e) => update(job.id, { title: e.target.value })} />
          <Label className="text-xs">Company</Label>
          <Input value={job.company} onChange={(e) => update(job.id, { company: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start</Label>
              <Input
                value={job.startDate}
                onChange={(e) => update(job.id, { startDate: e.target.value })}
                placeholder="2022"
              />
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Input
                value={job.endDate}
                onChange={(e) => update(job.id, { endDate: e.target.value })}
                placeholder="Present"
              />
            </div>
          </div>
          <Label className="text-xs">Description</Label>
          <Textarea
            rows={3}
            value={job.description}
            onChange={(e) => update(job.id, { description: e.target.value })}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="h-3.5 w-3.5" /> Add role
      </Button>
    </div>
  );
}

function EducationFields({
  items,
  onChange,
}: {
  items: EducationItem[];
  onChange: (next: EducationItem[]) => void;
}) {
  function update(id: string, patch: Partial<EducationItem>) {
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }
  function add() {
    onChange([
      ...items,
      { id: uid(), degree: "", institution: "", startDate: "", endDate: "", description: "" },
    ]);
  }
  return (
    <div className="space-y-3">
      {items.map((edu) => (
        <div key={edu.id} className="rounded-md border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs">Degree</Label>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-6 w-6"
              aria-label="Remove education"
              onClick={() => remove(edu.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <Input value={edu.degree} onChange={(e) => update(edu.id, { degree: e.target.value })} />
          <Label className="text-xs">Institution</Label>
          <Input
            value={edu.institution}
            onChange={(e) => update(edu.id, { institution: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Start</Label>
              <Input
                value={edu.startDate}
                onChange={(e) => update(edu.id, { startDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">End</Label>
              <Input
                value={edu.endDate}
                onChange={(e) => update(edu.id, { endDate: e.target.value })}
              />
            </div>
          </div>
          <Label className="text-xs">Notes (optional)</Label>
          <Textarea
            rows={2}
            value={edu.description}
            onChange={(e) => update(edu.id, { description: e.target.value })}
          />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="w-full">
        <Plus className="h-3.5 w-3.5" /> Add education
      </Button>
    </div>
  );
}

function SkillsFields({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = React.useState("");
  function commit() {
    const v = input.trim();
    if (!v) return;
    onChange([...skills, v]);
    setInput("");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {skills.map((s, i) => (
          <span
            key={`${s}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs"
          >
            {s}
            <button
              type="button"
              aria-label={`Remove ${s}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onChange(skills.filter((_, idx) => idx !== i))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder="Add a skill and press Enter"
        />
        <Button variant="outline" size="sm" onClick={commit}>
          Add
        </Button>
      </div>
    </div>
  );
}
