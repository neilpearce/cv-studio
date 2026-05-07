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

export function ModernPdfTemplate({ data }: { data: CVData }) {
  const accent = data.theme.accentColor || "#244CEC";
  const baseFont = fontMap[data.theme.fontFamily];
  const boldFont = fontBoldMap[data.theme.fontFamily];

  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      fontFamily: baseFont,
      fontSize: 10,
      color: "#111111",
    },
    header: {
      paddingTop: 40,
      paddingHorizontal: 40,
      paddingBottom: 20,
      flexDirection: "row",
      gap: 20,
      alignItems: "center",
    },
    photo: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#e5e7eb",
    },
    name: {
      fontSize: 28,
      fontFamily: boldFont,
      lineHeight: 1.1,
    },
    title: {
      fontSize: 13,
      color: "#374151",
      marginTop: 4,
    },
    body: {
      flexDirection: "row",
      paddingHorizontal: 40,
      paddingBottom: 40,
      gap: 24,
    },
    sidebar: { width: "33%" },
    sidebarBlock: { marginBottom: 18 },
    main: { width: "67%" },
    mainBlock: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 11,
      fontFamily: boldFont,
      letterSpacing: 1,
      color: accent,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    sectionRule: {
      height: 2,
      backgroundColor: accent,
      marginBottom: 8,
    },
    contactItem: {
      fontSize: 10,
      color: "#374151",
      marginBottom: 3,
    },
    eduItem: { marginBottom: 8 },
    eduDate: { fontSize: 9, color: "#6b7280", marginBottom: 1 },
    eduDegree: { fontFamily: boldFont, fontSize: 10 },
    eduInst: { fontSize: 10, color: "#374151" },
    eduDesc: { fontSize: 9, color: "#4b5563", marginTop: 2 },
    skillItem: { fontSize: 10, color: "#374151", marginBottom: 2 },
    profileText: { fontSize: 10, color: "#374151", lineHeight: 1.5 },
    expRow: { flexDirection: "row", marginBottom: 10 },
    expDate: { width: 70, fontSize: 9, color: "#6b7280", paddingTop: 2 },
    expBody: { flex: 1 },
    expTitle: { fontFamily: boldFont, fontSize: 11 },
    expCompany: { fontSize: 10, color: "#374151" },
    expDesc: { fontSize: 10, color: "#4b5563", marginTop: 3, lineHeight: 1.5 },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.photo} />
          <View>
            <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
            <Text style={styles.title}>{data.personal.title}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sidebar}>
            <View style={styles.sidebarBlock}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <View style={styles.sectionRule} />
              {data.personal.email ? <Text style={styles.contactItem}>{data.personal.email}</Text> : null}
              {data.personal.phone ? <Text style={styles.contactItem}>{data.personal.phone}</Text> : null}
              {data.personal.location ? <Text style={styles.contactItem}>{data.personal.location}</Text> : null}
              {data.personal.website ? <Text style={styles.contactItem}>{data.personal.website}</Text> : null}
            </View>

            {data.sectionOrder.includes("education") && data.education.length > 0 ? (
              <View style={styles.sidebarBlock}>
                <Text style={styles.sectionTitle}>Education</Text>
                <View style={styles.sectionRule} />
                {data.education.map((e) => (
                  <View key={e.id} style={styles.eduItem}>
                    <Text style={styles.eduDate}>
                      {e.startDate}{e.endDate ? ` – ${e.endDate}` : ""}
                    </Text>
                    <Text style={styles.eduDegree}>{e.degree}</Text>
                    <Text style={styles.eduInst}>{e.institution}</Text>
                    {e.description ? <Text style={styles.eduDesc}>{e.description}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {data.sectionOrder.includes("skills") && data.skills.length > 0 ? (
              <View style={styles.sidebarBlock}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.sectionRule} />
                {data.skills.map((s, i) => (
                  <Text key={i} style={styles.skillItem}>{s}</Text>
                ))}
              </View>
            ) : null}
          </View>

          <View style={styles.main}>
            {data.sectionOrder.map((key) => {
              if (key === "profile" && data.profile) {
                return (
                  <View key={key} style={styles.mainBlock}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.sectionRule} />
                    <Text style={styles.profileText}>{data.profile}</Text>
                  </View>
                );
              }
              if (key === "experience" && data.experience.length > 0) {
                return (
                  <View key={key} style={styles.mainBlock}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    <View style={styles.sectionRule} />
                    {data.experience.map((job) => (
                      <View key={job.id} style={styles.expRow}>
                        <Text style={styles.expDate}>
                          {job.startDate}
                          {job.endDate ? ` – ${job.endDate}` : ""}
                        </Text>
                        <View style={styles.expBody}>
                          <Text style={styles.expTitle}>{job.title}</Text>
                          <Text style={styles.expCompany}>{job.company}</Text>
                          {job.description ? <Text style={styles.expDesc}>{job.description}</Text> : null}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
}
