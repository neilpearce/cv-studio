import type { CoverLetterData, CoverLetterTemplateId } from "@/lib/cover-letter-types";
import { ModernCoverLetterPdf } from "./ModernCoverLetterPdf";

export function renderCoverLetterPdf(
  _template: CoverLetterTemplateId,
  data: CoverLetterData,
) {
  return <ModernCoverLetterPdf data={data} />;
}
