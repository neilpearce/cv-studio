"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Personal } from "@/lib/cv-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PersonalForm({
  value,
  onChange,
}: {
  value: Personal;
  onChange: (next: Personal) => void;
}) {
  function update<K extends keyof Personal>(key: K, v: Personal[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Field label="Full name">
          <Input value={value.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </Field>
        <Field label="Title / role">
          <Input value={value.title} onChange={(e) => update("title", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Email">
            <Input value={value.email} onChange={(e) => update("email", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={value.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Location">
            <Input value={value.location} onChange={(e) => update("location", e.target.value)} />
          </Field>
          <Field label="Website">
            <Input value={value.website} onChange={(e) => update("website", e.target.value)} />
          </Field>
        </div>
        <Field label="Photo URL (optional)">
          <Input
            value={value.photoUrl ?? ""}
            placeholder="https://…"
            onChange={(e) => update("photoUrl", e.target.value)}
          />
        </Field>
      </CardContent>
    </Card>
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
