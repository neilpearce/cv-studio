import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CoverLetterData } from "@/lib/cover-letter-types";

const fontMap = {
  sans: "Helvetica",
  serif: "Times-Roman",
  mono: "Courier",
} as const;

const fontBoldMap = {
  sans: "Helvetica-Bold",
  serif: "Times-Bold",
  mono: "Courier-Bold",
} as const;

export function ModernCoverLetterPdf({ data }: { data: CoverLetterData }) {
  const accent = data.theme.accentColor || "#244CEC";
  const baseFont = fontMap[data.theme.fontFamily];
  const boldFont = fontBoldMap[data.theme.fontFamily];

  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      fontFamily: baseFont,
      fontSize: 10,
      color: "#111111",
      paddingHorizontal: 64,
      paddingVertical: 64,
    },
    header: {
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginBottom: 28,
    },
    name: {
      fontSize: 18,
      fontFamily: boldFont,
      color: accent,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 6,
    },
    metaItem: {
      fontSize: 9,
      color: "#6b7280",
      marginRight: 12,
    },
    date: {
      fontSize: 11,
      color: "#374151",
      marginBottom: 18,
    },
    recipient: {
      marginBottom: 22,
    },
    recipientLine: {
      fontSize: 11,
      color: "#374151",
      marginBottom: 1,
    },
    subject: {
      fontSize: 12,
      fontFamily: boldFont,
      marginBottom: 18,
    },
    greeting: {
      fontSize: 11,
      marginBottom: 14,
    },
    paragraph: {
      fontSize: 11,
      lineHeight: 1.6,
      color: "#374151",
      marginBottom: 12,
    },
    closing: {
      fontSize: 11,
      marginTop: 16,
    },
    signature: {
      fontSize: 12,
      fontFamily: boldFont,
      marginTop: 4,
    },
  });

  const recipientLines: string[] = [];
  if (data.recipient.name) recipientLines.push(data.recipient.name);
  if (data.recipient.title) recipientLines.push(data.recipient.title);
  if (data.recipient.company) recipientLines.push(data.recipient.company);
  if (data.recipient.address) {
    for (const line of data.recipient.address.split("\n")) {
      if (line.trim()) recipientLines.push(line);
    }
  }

  const meta = [
    data.sender.email,
    data.sender.phone,
    data.sender.location,
    data.sender.website,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.sender.fullName || "Your Name"}</Text>
          {meta.length > 0 ? (
            <View style={styles.metaRow}>
              {meta.map((m, i) => (
                <Text key={i} style={styles.metaItem}>
                  {m}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {data.date ? <Text style={styles.date}>{data.date}</Text> : null}

        {recipientLines.length > 0 ? (
          <View style={styles.recipient}>
            {recipientLines.map((line, i) => (
              <Text key={i} style={styles.recipientLine}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {data.subject ? <Text style={styles.subject}>{data.subject}</Text> : null}
        {data.greeting ? <Text style={styles.greeting}>{data.greeting}</Text> : null}

        {data.body.map((p) => (
          <Text key={p.id} style={styles.paragraph}>
            {p.text}
          </Text>
        ))}

        {data.closing ? <Text style={styles.closing}>{data.closing}</Text> : null}
        {data.signature ? <Text style={styles.signature}>{data.signature}</Text> : null}
      </Page>
    </Document>
  );
}
