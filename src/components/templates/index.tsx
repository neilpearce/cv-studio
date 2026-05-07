import type { CVData, TemplateId } from "@/lib/cv-types";
import { ModernTemplate } from "./ModernTemplate";
import { MinimalTemplate } from "./MinimalTemplate";

export const TEMPLATES: Record<TemplateId, { name: string; component: React.FC<{ data: CVData }> }> = {
  modern: { name: "Modern", component: ModernTemplate },
  minimal: { name: "Minimal", component: MinimalTemplate },
};

export function renderTemplate(template: TemplateId, data: CVData) {
  const Component = TEMPLATES[template]?.component ?? ModernTemplate;
  return <Component data={data} />;
}
