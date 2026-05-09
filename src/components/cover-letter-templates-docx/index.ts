import type { Document } from "docx";
import type { CoverLetterData, CoverLetterTemplateId } from "@/lib/cover-letter-types";
import { buildModernCoverLetterDocx } from "./ModernCoverLetterDocx";

export function buildCoverLetterDocx(
  _template: CoverLetterTemplateId,
  data: CoverLetterData,
): Document {
  return buildModernCoverLetterDocx(data);
}
