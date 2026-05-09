import { z } from "zod";

export const senderSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
});

export const recipientSchema = z.object({
  name: z.string(),
  title: z.string(),
  company: z.string(),
  address: z.string(),
});

export const paragraphSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const coverLetterThemeSchema = z.object({
  accentColor: z.string(),
  fontFamily: z.enum(["sans", "serif", "mono"]),
});

export const coverLetterDataSchema = z.object({
  sender: senderSchema,
  recipient: recipientSchema,
  date: z.string(),
  subject: z.string(),
  greeting: z.string(),
  body: z.array(paragraphSchema),
  closing: z.string(),
  signature: z.string(),
  theme: coverLetterThemeSchema,
});

export type Sender = z.infer<typeof senderSchema>;
export type Recipient = z.infer<typeof recipientSchema>;
export type Paragraph = z.infer<typeof paragraphSchema>;
export type CoverLetterTheme = z.infer<typeof coverLetterThemeSchema>;
export type CoverLetterData = z.infer<typeof coverLetterDataSchema>;

export const COVER_LETTER_TEMPLATE_IDS = ["modern"] as const;
export type CoverLetterTemplateId = (typeof COVER_LETTER_TEMPLATE_IDS)[number];
