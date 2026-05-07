"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Theme } from "@/lib/cv-types";

const PRESETS = ["#244CEC", "#0F172A", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function ThemeControls({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Style</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Accent color</Label>
          <div className="flex flex-wrap items-center gap-2">
            {PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onChange({ ...theme, accentColor: color })}
                aria-label={`Use ${color}`}
                className="h-7 w-7 rounded-full border ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[active=true]:ring-2 data-[active=true]:ring-ring"
                data-active={theme.accentColor === color}
                style={{ background: color }}
              />
            ))}
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => onChange({ ...theme, accentColor: e.target.value })}
              aria-label="Custom color"
              className="h-7 w-9 cursor-pointer rounded border bg-transparent"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Font</Label>
          <Select
            value={theme.fontFamily}
            onValueChange={(v) =>
              onChange({ ...theme, fontFamily: v as Theme["fontFamily"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans">Sans (Inter)</SelectItem>
              <SelectItem value="serif">Serif (Source Serif)</SelectItem>
              <SelectItem value="mono">Mono (JetBrains)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
