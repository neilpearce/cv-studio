import type { CoverLetterData } from "./cover-letter-types";
import { uid } from "./default-cv";

export function todayFormatted(): string {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function defaultCoverLetter(): CoverLetterData {
  return {
    sender: {
      fullName: "Your Name",
      email: "you@example.com",
      phone: "+44 20 0000 0000",
      location: "City, Country",
      website: "yourwebsite.com",
    },
    recipient: {
      name: "Hiring Team",
      title: "",
      company: "Company Name",
      address: "",
    },
    date: todayFormatted(),
    subject: "Application for the Senior Designer role",
    greeting: "Dear Hiring Team,",
    body: [
      {
        id: uid(),
        text: "I'm writing to express my interest in the Senior Designer role. Your work on [specific product/initiative] caught my attention because [genuine reason], and I'd love to bring my experience to your team.",
      },
      {
        id: uid(),
        text: "Over the past few years I've led design on [project] where I [outcome with a number], and shipped [another thing] that [impact]. I work closely with engineers and PMs end-to-end, from research through ship.",
      },
      {
        id: uid(),
        text: "I'd welcome the chance to talk about how I could contribute. My CV has more detail and I'm happy to share work in any format that suits.",
      },
    ],
    closing: "Best regards,",
    signature: "Your Name",
    theme: {
      accentColor: "#244CEC",
      fontFamily: "sans",
    },
  };
}
