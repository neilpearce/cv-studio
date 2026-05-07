import { z } from "zod";

export const personalSchema = z.object({
  fullName: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
  photoUrl: z.string().optional(),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const themeSchema = z.object({
  accentColor: z.string(),
  fontFamily: z.enum(["sans", "serif", "mono"]),
});

export const SECTION_KEYS = [
  "profile",
  "experience",
  "education",
  "skills",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const cvDataSchema = z.object({
  personal: personalSchema,
  profile: z.string(),
  experience: z.array(experienceItemSchema),
  education: z.array(educationItemSchema),
  skills: z.array(z.string()),
  sectionOrder: z.array(z.enum(SECTION_KEYS)),
  theme: themeSchema,
});

export type Personal = z.infer<typeof personalSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type CVData = z.infer<typeof cvDataSchema>;
export type Theme = z.infer<typeof themeSchema>;

export const TEMPLATE_IDS = ["modern", "minimal"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const SECTION_TITLES: Record<SectionKey, string> = {
  profile: "Profile",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
};
