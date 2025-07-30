import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  heading: { fontSize: 16, marginBottom: 4, fontWeight: 700 },
  text: { fontSize: 12 },
});

export default function ResumePDF({
  name,
  summary,
  experience,
  skills,
  education,
}: {
  name: string;
  summary: string;
  experience: string[];
  skills: string[];
  education: string;
}) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>{name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Summary</Text>
          <Text style={styles.text}>{summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Experience</Text>
          {experience.map((exp, idx) => (
            <Text key={idx} style={styles.text}>
              • {exp}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Skills</Text>
          <Text style={styles.text}>{skills.join(", ")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Education</Text>
          <Text style={styles.text}>{education}</Text>
        </View>
      </Page>
    </Document>
  );
}
