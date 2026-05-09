import type { CoverLetterData, CoverLetterTemplateId } from "@/lib/cover-letter-types";
import { ModernCoverLetter } from "./ModernCoverLetter";

export const COVER_LETTER_TEMPLATES: Record<
  CoverLetterTemplateId,
  { name: string; component: React.FC<{ data: CoverLetterData }> }
> = {
  modern: { name: "Modern", component: ModernCoverLetter },
};

export function renderCoverLetter(
  template: CoverLetterTemplateId,
  data: CoverLetterData,
) {
  const Component = COVER_LETTER_TEMPLATES[template]?.component ?? ModernCoverLetter;
  return <Component data={data} />;
}
