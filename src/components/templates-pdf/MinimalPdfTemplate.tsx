import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/cv-types";

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

export function MinimalPdfTemplate({ data }: { data: CVData }) {
  const accent = data.theme.accentColor || "#111111";
  const baseFont = fontMap[data.theme.fontFamily];
  const boldFont = fontBoldMap[data.theme.fontFamily];

  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      fontFamily: baseFont,
      fontSize: 10,
      color: "#111111",
      paddingHorizontal: 56,
      paddingVertical: 56,
    },
    header: {
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
      marginBottom: 24,
    },
    name: {
      fontSize: 22,
      fontFamily: boldFont,
      color: accent,
    },
    title: {
      fontSize: 12,
      color: "#4b5563",
      marginTop: 2,
    },
    metaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
    },
    metaItem: {
      fontSize: 9,
      color: "#6b7280",
      marginRight: 12,
    },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 9,
      fontFamily: boldFont,
      letterSpacing: 1.5,
      color: "#9ca3af",
      textTransform: "uppercase",
      marginBottom: 6,
    },
    paragraph: { fontSize: 10, color: "#374151", lineHeight: 1.5 },
    item: { marginBottom: 8 },
    itemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    itemTitleLine: { fontSize: 10, flex: 1, paddingRight: 8 },
    itemTitleBold: { fontFamily: boldFont },
    itemMeta: { color: "#6b7280" },
    itemDate: { fontSize: 9, color: "#6b7280" },
    itemDesc: { fontSize: 10, color: "#374151", marginTop: 2, lineHeight: 1.5 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
          <Text style={styles.title}>{data.personal.title}</Text>
          <View style={styles.metaRow}>
            {data.personal.email ? <Text style={styles.metaItem}>{data.personal.email}</Text> : null}
            {data.personal.phone ? <Text style={styles.metaItem}>{data.personal.phone}</Text> : null}
            {data.personal.location ? <Text style={styles.metaItem}>{data.personal.location}</Text> : null}
            {data.personal.website ? <Text style={styles.metaItem}>{data.personal.website}</Text> : null}
          </View>
        </View>

        {data.sectionOrder.map((key) => {
          if (key === "profile" && data.profile) {
            return (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>Profile</Text>
                <Text style={styles.paragraph}>{data.profile}</Text>
              </View>
            );
          }
          if (key === "experience" && data.experience.length > 0) {
            return (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>
                {data.experience.map((job) => (
                  <View key={job.id} style={styles.item}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitleLine}>
                        <Text style={styles.itemTitleBold}>{job.title}</Text>
                        <Text style={styles.itemMeta}>{job.company ? ` · ${job.company}` : ""}</Text>
                      </Text>
                      <Text style={styles.itemDate}>
                        {job.startDate}
                        {job.endDate ? ` – ${job.endDate}` : ""}
                      </Text>
                    </View>
                    {job.description ? <Text style={styles.itemDesc}>{job.description}</Text> : null}
                  </View>
                ))}
              </View>
            );
          }
          if (key === "education" && data.education.length > 0) {
            return (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {data.education.map((e) => (
                  <View key={e.id} style={styles.item}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitleLine}>
                        <Text style={styles.itemTitleBold}>{e.degree}</Text>
                        <Text style={styles.itemMeta}>{e.institution ? ` · ${e.institution}` : ""}</Text>
                      </Text>
                      <Text style={styles.itemDate}>
                        {e.startDate}
                        {e.endDate ? ` – ${e.endDate}` : ""}
                      </Text>
                    </View>
                    {e.description ? <Text style={styles.itemDesc}>{e.description}</Text> : null}
                  </View>
                ))}
              </View>
            );
          }
          if (key === "skills" && data.skills.length > 0) {
            return (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <Text style={styles.paragraph}>{data.skills.join("  ·  ")}</Text>
              </View>
            );
          }
          return null;
        })}
      </Page>
    </Document>
  );
}
