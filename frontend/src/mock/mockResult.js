export const mockResults = [
  {
    type: "prescription_report",
    outcome: "needs_doctor",
    warnings: [
      {
        level: "major",
        text: "Two medicines can raise bleeding risk together. Ask a doctor or pharmacist before continuing."
      }
    ],
    sections: [
      {
        title: "Common use",
        body: "This medicine is commonly used for a symptom and may need a clinician review before use.",
        sources: ["Sample source (not real)"]
      },
      {
        title: "How to check",
        body: "Review the full list of medicines and discuss any combination concerns with a clinician before use.",
        sources: ["Sample source (not real)"]
      }
    ],
    disclaimer: "MediSense gives general information from verified sources. It is not medical advice and does not replace a doctor or pharmacist."
  },
  {
    type: "answer",
    outcome: "emergency",
    warnings: [
      {
        level: "major",
        text: "Get medical help now. This situation needs immediate attention."
      }
    ],
    sections: [],
    disclaimer: "MediSense gives general information from verified sources. It is not medical advice and does not replace a doctor or pharmacist."
  },
  {
    type: "prescription_report",
    outcome: "ok",
    warnings: [],
    sections: [
      {
        title: "Common use",
        body: "This medicine is commonly used for a symptom and is often discussed with a clinician before use.",
        sources: ["Sample source (not real)"]
      },
      {
        title: "How to review",
        body: "Check the full medicine list and ask a pharmacist or doctor about any concerns before starting or stopping use.",
        sources: ["Sample source (not real)"]
      },
      {
        title: "Follow up",
        body: "If symptoms continue, speak with a clinician for a clear review and next steps.",
        sources: ["Sample source (not real)"]
      }
    ],
    disclaimer: "MediSense gives general information from verified sources. It is not medical advice and does not replace a doctor or pharmacist."
  }
];
