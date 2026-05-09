import type { Document } from "docx";
import type { CVData, TemplateId } from "@/lib/cv-types";
import { buildModernDocx } from "./ModernDocx";
import { buildMinimalDocx } from "./MinimalDocx";

export function buildDocx(template: TemplateId, data: CVData): Document {
  if (template === "minimal") return buildMinimalDocx(data);
  return buildModernDocx(data);
}
