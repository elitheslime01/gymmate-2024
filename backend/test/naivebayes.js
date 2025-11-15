import { classifyFeedback, getSentimentTrainingStatus } from "../utils/sentimentAnalyzer.js";

const samples = [
  {
    text: "Hindi ako makapasok sa gymmate, lagi akong nasa queue",
    note: "expected negative",
  },
  {
    text: "Hindi ako makapagbook ng slot sa gymmate",
    note: "expected negative",
  },
  {
    text: "Mabilis at maayos ang proseso kaya masaya ako",
    note: "expected positive",
  },
  {
    text: "Ayos lang naman ang sistema, wala akong gaanong napansin",
    note: "expected neutral",
  },
];

const run = async () => {
  try {
    const outputs = [];
    for (const sample of samples) {
      const sentiment = await classifyFeedback(sample.text);
      outputs.push({ ...sample, sentiment });
    }

    outputs.forEach((item) => {
      console.log(`${item.text} (${item.note}) => ${item.sentiment}`);
    });

    const status = getSentimentTrainingStatus();
    console.log("\nModel status:", status);
    process.exit(0);
  } catch (error) {
    console.error("Error while running Naive Bayes check:", error.message);
    process.exit(1);
  }
};

run();