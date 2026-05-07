import type { CVData } from "./cv-types";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultCV(): CVData {
  return {
    personal: {
      fullName: "Your Name",
      title: "Your Role",
      email: "you@example.com",
      phone: "+1 555 0100",
      location: "City, Country",
      website: "yourwebsite.com",
      photoUrl: "",
    },
    profile:
      "A short paragraph that summarises who you are, what you do, and what you bring to a team. Edit this to match your experience.",
    experience: [
      {
        id: uid(),
        title: "Senior Designer",
        company: "Company Name",
        startDate: "2022",
        endDate: "Present",
        description:
          "Led design for a multi-product platform. Shipped a redesigned onboarding that lifted activation by 22%.",
      },
      {
        id: uid(),
        title: "Designer",
        company: "Earlier Company",
        startDate: "2019",
        endDate: "2022",
        description:
          "Designed and shipped features across web and mobile. Partnered with engineering to ship weekly releases.",
      },
    ],
    education: [
      {
        id: uid(),
        degree: "BSc, Design",
        institution: "Your University",
        startDate: "2015",
        endDate: "2019",
        description: "Honours, with a focus on human-computer interaction.",
      },
    ],
    skills: [
      "Product design",
      "Prototyping",
      "Design systems",
      "User research",
      "Figma",
      "Accessibility",
    ],
    sectionOrder: ["profile", "experience", "education", "skills"],
    theme: {
      accentColor: "#244CEC",
      fontFamily: "sans",
    },
  };
}
