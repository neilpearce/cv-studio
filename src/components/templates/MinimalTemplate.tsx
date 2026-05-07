import type { CVData } from "@/lib/cv-types";

interface TemplateProps {
  data: CVData;
}

const fontStack: Record<CVData["theme"]["fontFamily"], string> = {
  sans: '"Inter", "Helvetica Neue", system-ui, sans-serif',
  serif: '"Source Serif Pro", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

export function MinimalTemplate({ data }: TemplateProps) {
  const { personal, theme, sectionOrder } = data;
  const accent = theme.accentColor || "#111111";

  return (
    <div
      className="cv-page mx-auto"
      style={{ fontFamily: fontStack[theme.fontFamily], color: "#111" }}
    >
      <div className="px-16 py-16">
        <header className="mb-10 border-b pb-6" style={{ borderColor: "#e5e7eb" }}>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: accent }}>
            {personal.fullName || "Your Name"}
          </h1>
          <p className="mt-1 text-base" style={{ color: "#4b5563" }}>{personal.title}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]" style={{ color: "#6b7280" }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.website && <span>{personal.website}</span>}
          </div>
        </header>

        <div className="space-y-7">
          {sectionOrder.map((key) => {
            if (key === "profile" && data.profile) {
              return (
                <Section key={key} title="Profile">
                  <p className="text-[13.5px] leading-relaxed" style={{ color: "#374151" }}>
                    {data.profile}
                  </p>
                </Section>
              );
            }
            if (key === "experience" && data.experience.length > 0) {
              return (
                <Section key={key} title="Experience">
                  <div className="space-y-4">
                    {data.experience.map((job) => (
                      <div key={job.id}>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-semibold">{job.title}</span>
                            <span style={{ color: "#6b7280" }}> · {job.company}</span>
                          </div>
                          <span className="text-[12.5px]" style={{ color: "#6b7280" }}>
                            {job.startDate}{job.endDate ? ` – ${job.endDate}` : ""}
                          </span>
                        </div>
                        {job.description && (
                          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "#374151" }}>
                            {job.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              );
            }
            if (key === "education" && data.education.length > 0) {
              return (
                <Section key={key} title="Education">
                  <div className="space-y-3">
                    {data.education.map((e) => (
                      <div key={e.id}>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="font-semibold">{e.degree}</span>
                            <span style={{ color: "#6b7280" }}> · {e.institution}</span>
                          </div>
                          <span className="text-[12.5px]" style={{ color: "#6b7280" }}>
                            {e.startDate}{e.endDate ? ` – ${e.endDate}` : ""}
                          </span>
                        </div>
                        {e.description && (
                          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "#374151" }}>
                            {e.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              );
            }
            if (key === "skills" && data.skills.length > 0) {
              return (
                <Section key={key} title="Skills">
                  <p className="text-[13px]" style={{ color: "#374151" }}>
                    {data.skills.join("  ·  ")}
                  </p>
                </Section>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: "#9ca3af" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
