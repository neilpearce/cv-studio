import type { CVData } from "@/lib/cv-types";

interface TemplateProps {
  data: CVData;
}

const fontStack: Record<CVData["theme"]["fontFamily"], string> = {
  sans: '"Inter", "Helvetica Neue", system-ui, sans-serif',
  serif: '"Source Serif Pro", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

export function ModernTemplate({ data }: TemplateProps) {
  const { personal, theme, sectionOrder } = data;
  const accent = theme.accentColor || "#244CEC";

  return (
    <div
      className="cv-page mx-auto"
      style={{ fontFamily: fontStack[theme.fontFamily], color: "#111" }}
    >
      <div className="px-12 pt-12 pb-6">
        <div className="flex items-start gap-6">
          {personal.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={personal.photoUrl}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="h-24 w-24 rounded-full"
              style={{ background: "#e5e7eb" }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              {personal.fullName || "Your Name"}
            </h1>
            <p className="mt-1 text-lg" style={{ color: "#374151" }}>
              {personal.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 px-12 pb-12">
        <aside className="col-span-4 space-y-6 text-sm">
          <Section title="Contact" accent={accent}>
            <ul className="space-y-1.5 text-[13px]" style={{ color: "#374151" }}>
              {personal.email && <li>{personal.email}</li>}
              {personal.phone && <li>{personal.phone}</li>}
              {personal.location && <li>{personal.location}</li>}
              {personal.website && <li>{personal.website}</li>}
            </ul>
          </Section>

          {sectionOrder.includes("education") && data.education.length > 0 && (
            <Section title="Education" accent={accent}>
              <div className="space-y-3">
                {data.education.map((e) => (
                  <div key={e.id} className="text-[13px]">
                    <div className="text-[12px]" style={{ color: "#6b7280" }}>
                      {e.startDate}{e.endDate ? ` – ${e.endDate}` : ""}
                    </div>
                    <div className="font-semibold">{e.degree}</div>
                    <div style={{ color: "#374151" }}>{e.institution}</div>
                    {e.description && (
                      <div className="mt-1" style={{ color: "#4b5563" }}>{e.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {sectionOrder.includes("skills") && data.skills.length > 0 && (
            <Section title="Skills" accent={accent}>
              <ul className="space-y-1 text-[13px]" style={{ color: "#374151" }}>
                {data.skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Section>
          )}
        </aside>

        <main className="col-span-8 space-y-6">
          {sectionOrder.map((key) => {
            if (key === "profile" && data.profile) {
              return (
                <Section key={key} title="Profile" accent={accent}>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#374151" }}>
                    {data.profile}
                  </p>
                </Section>
              );
            }
            if (key === "experience" && data.experience.length > 0) {
              return (
                <Section key={key} title="Experience" accent={accent}>
                  <div className="space-y-4">
                    {data.experience.map((job) => (
                      <div key={job.id} className="grid grid-cols-[110px_1fr] gap-4">
                        <div className="text-[12px]" style={{ color: "#6b7280" }}>
                          {job.startDate}{job.endDate ? ` – ${job.endDate}` : ""}
                        </div>
                        <div>
                          <div className="font-semibold text-[14px]">{job.title}</div>
                          <div className="text-[13px]" style={{ color: "#374151" }}>{job.company}</div>
                          {job.description && (
                            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "#4b5563" }}>
                              {job.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              );
            }
            return null;
          })}
        </main>
      </div>
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="mb-2 text-[15px] font-bold uppercase tracking-wider"
        style={{ color: accent }}
      >
        {title}
      </h2>
      <div className="mb-3 h-[2px]" style={{ background: accent }} />
      {children}
    </section>
  );
}

