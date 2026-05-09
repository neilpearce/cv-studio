import type { CoverLetterData } from "@/lib/cover-letter-types";

const fontStack: Record<CoverLetterData["theme"]["fontFamily"], string> = {
  sans: '"Inter", "Helvetica Neue", system-ui, sans-serif',
  serif: '"Source Serif Pro", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
};

export function ModernCoverLetter({ data }: { data: CoverLetterData }) {
  const accent = data.theme.accentColor || "#244CEC";

  return (
    <div
      className="cv-page mx-auto"
      style={{ fontFamily: fontStack[data.theme.fontFamily], color: "#111" }}
    >
      <div className="px-16 pt-16 pb-16">
        <header className="mb-10 border-b pb-5" style={{ borderColor: "#e5e7eb" }}>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: accent }}>
            {data.sender.fullName || "Your Name"}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]" style={{ color: "#6b7280" }}>
            {data.sender.email && <span>{data.sender.email}</span>}
            {data.sender.phone && <span>{data.sender.phone}</span>}
            {data.sender.location && <span>{data.sender.location}</span>}
            {data.sender.website && <span>{data.sender.website}</span>}
          </div>
        </header>

        {data.date && (
          <p className="mb-6 text-[13px]" style={{ color: "#374151" }}>
            {data.date}
          </p>
        )}

        {(data.recipient.name ||
          data.recipient.title ||
          data.recipient.company ||
          data.recipient.address) && (
          <div className="mb-8 text-[13px]" style={{ color: "#374151" }}>
            {data.recipient.name && <div>{data.recipient.name}</div>}
            {data.recipient.title && <div>{data.recipient.title}</div>}
            {data.recipient.company && <div>{data.recipient.company}</div>}
            {data.recipient.address &&
              data.recipient.address.split("\n").map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}

        {data.subject && (
          <p className="mb-6 text-[14px] font-semibold" style={{ color: "#111" }}>
            {data.subject}
          </p>
        )}

        {data.greeting && (
          <p className="mb-4 text-[13.5px]" style={{ color: "#111" }}>
            {data.greeting}
          </p>
        )}

        <div className="space-y-4">
          {data.body.map((p) => (
            <p
              key={p.id}
              className="text-[13.5px] leading-relaxed"
              style={{ color: "#374151" }}
            >
              {p.text}
            </p>
          ))}
        </div>

        {data.closing && (
          <p className="mt-8 text-[13.5px]" style={{ color: "#111" }}>
            {data.closing}
          </p>
        )}

        {data.signature && (
          <p className="mt-1 text-[14px] font-semibold" style={{ color: "#111" }}>
            {data.signature}
          </p>
        )}
      </div>
    </div>
  );
}
