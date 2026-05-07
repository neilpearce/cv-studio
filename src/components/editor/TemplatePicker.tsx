"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES } from "@/components/templates";
import type { TemplateId } from "@/lib/cv-types";
import { cn } from "@/lib/utils";

export function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (next: TemplateId) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Template</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TEMPLATES) as TemplateId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                "rounded-md border p-3 text-left text-sm transition-colors hover:bg-accent",
                value === id ? "border-primary ring-2 ring-primary/30" : "border-border",
              )}
            >
              <div className="font-medium">{TEMPLATES[id].name}</div>
              <div className="mt-2 h-16 rounded-sm bg-gradient-to-br from-muted to-muted-foreground/20" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
