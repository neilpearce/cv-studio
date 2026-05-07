import type { CVData, TemplateId } from "@/lib/cv-types";
import { ModernPdfTemplate } from "./ModernPdfTemplate";
import { MinimalPdfTemplate } from "./MinimalPdfTemplate";

export function renderPdf(template: TemplateId, data: CVData) {
  if (template === "minimal") return <MinimalPdfTemplate data={data} />;
  return <ModernPdfTemplate data={data} />;
}
