import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { classifyFeedback } from "../utils/sentimentAnalyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const POSITIVE_SEGMENTS = {
  openers: [
    "Ang dali na",
    "Love the way",
    "Solid ang",
    "Happy ako sa",
    "Appreciate how",
    "Nagustuhan ko",
    "Super ganda ng",
    "Astig ang",
    "Hands down,",
    "Really enjoy",
    "Thrilled with",
    "Nakakatuwa na",
    "Proud ako sa",
  ],
  features: [
    "pag-book ng slots",
    "bagong layout",
    "queue updates",
    "notifications",
    "confirmation email",
    "calendar view",
    "mobile responsiveness",
    "AR image quality",
    "dashboard summary",
    "check-in process",
    "progress tracking",
    "membership portal",
  ],
  closers: [
    "—keep it up!",
    "kahit peak hours!",
    "kaya mabilis akong makapag-ayos ngayon.",
    "sobrang convenient na.",
    "salamat sa team!",
    "madali na mag-monitor ng progress.",
    "smooth at walang aberya.",
    "legit na improvement!",
    "best update so far!",
    "makes my day easier.",
    "na-inspire tuloy akong magworkout.",
    "keeps me organized.",
  ],
};

const NEUTRAL_SEGMENTS = {
  openers: [
    "Ayos lang",
    "So far",
    "As expected",
    "Steady lang",
    "Average lang",
    "Okay naman",
    "Same pa rin",
    "Normal naman",
    "Minsan okay",
    "Noticing",
    "Napansin ko na",
  ],
  features: [
    "ang booking flow",
    "ang UI sa tablet",
    "ang paggamit ng AR upload",
    "ang pag-view ng schedule",
    "ang notifications",
    "ang profile section",
    "ang queue refresh",
    "ang analytics page",
    "ang membership info",
    "ang weekly summary",
  ],
  closers: [
    "—walang kakaiba.",
    "pero walang wow factor.",
    "sakto lang for daily use.",
    "steady lang kahit marami kami.",
    "wala namang naging problema.",
    "same experience as before.",
    "di naman nagbago ang workflow.",
    "nothing special, just okay.",
    "pang-araw-araw lang talaga.",
    "neither better nor worse.",
  ],
};

const NEGATIVE_SEGMENTS = {
  openers: [
    "Hirap gamitin",
    "Hindi gumagana",
    "Laging nagsi-crash",
    "Na-stuck ako sa",
    "Di ako makapag-time in sa",
    "Sobrang bagal",
    "Nagdo-double book pa rin",
    "Hindi tumutugma",
    "Frustrated ako sa",
    "Nakakainis na",
    "I keep getting",
  ],
  features: [
    "queue refresh",
    "time-in button",
    "booking confirmation",
    "calendar schedule",
    "account update",
    "notification system",
    "AR upload",
    "mobile view",
    "membership portal",
    "progress reports",
    "support tickets",
  ],
  closers: [
    "kahit ilang beses kong subukan.",
    "kaya napipilitan akong mag manual.",
    "kaya na-miss ko ang slot ko.",
    "pati after ng latest update.",
    "grabe kasi nakakaperwisyo.",
    "hindi talaga usable ngayong araw.",
    "lagi akong naiiwan sa queue.",
    "nakakapagod na ulit-ulitin.",
    "nagiging hassle tuloy ang routine ko.",
    "kailangan pa laging mag-report.",
  ],
};

const TYPES = ["positive", "neutral", "negative"];
const DEFAULT_ITERATIONS = 10;
const SAMPLES_PER_TYPE = 10;
const TARGET_ACCURACY = 0.9;

const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];

const buildSentence = (segments) =>
  `${randomChoice(segments.openers)} ${randomChoice(segments.features)} ${randomChoice(segments.closers)}`;

const generators = {
  positive: () => buildSentence(POSITIVE_SEGMENTS),
  neutral: () => buildSentence(NEUTRAL_SEGMENTS),
  negative: () => buildSentence(NEGATIVE_SEGMENTS),
};

const createDataset = () => {
  const samples = [];
  TYPES.forEach((type) => {
    for (let i = 0; i < SAMPLES_PER_TYPE; i += 1) {
      samples.push({
        expected: type,
        text: generators[type](),
      });
    }
  });
  return samples;
};

const evaluateSamples = async (samples) => {
  let correct = 0;
  const details = [];

  for (const sample of samples) {
    const predicted = await classifyFeedback(sample.text);
    const isCorrect = predicted === sample.expected;

    if (isCorrect) {
      correct += 1;
    }

    details.push({ ...sample, predicted, isCorrect });

  // intentionally no-op: model remains static during stress tests
  }

  return {
    accuracy: correct / samples.length,
    details,
  };
};

const run = async () => {
  const maxIterationsArg = Number(process.argv[2]);
  const maxIterations = Number.isFinite(maxIterationsArg) && maxIterationsArg > 0
    ? Math.floor(maxIterationsArg)
    : DEFAULT_ITERATIONS;

  let overallBest = 0;
  const misclassifications = [];

  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const dataset = createDataset();
    const { accuracy, details } = await evaluateSamples(dataset);
    overallBest = Math.max(overallBest, accuracy);

    const iterationSummary = TYPES.reduce(
      (acc, type) => {
        const subset = details.filter((item) => item.expected === type);
        const correctCount = subset.filter((item) => item.isCorrect).length;
        acc[type] = `${correctCount}/${subset.length}`;
        return acc;
      },
      {}
    );

    console.log(`Iteration ${iteration}: accuracy ${(accuracy * 100).toFixed(1)}%`);
    console.log("Per-class correct:", iterationSummary);

    details
      .filter((item) => !item.isCorrect)
      .forEach((item) => {
        misclassifications.push({ iteration, ...item });
        console.log(
          `  ✗ [${item.expected} → ${item.predicted}] ${item.text}`
        );
      });

    if (accuracy >= TARGET_ACCURACY) {
      console.log(`Reached target accuracy ${(TARGET_ACCURACY * 100)}% on iteration ${iteration}.`);
      break;
    }
  }

  console.log("\nBest accuracy achieved:", (overallBest * 100).toFixed(1) + "%");

  if (misclassifications.length) {
    console.log("\nMisclassifications (recent runs):");
    misclassifications.forEach((item) => {
      console.log(
        `  Iter ${item.iteration}: expected ${item.expected}, predicted ${item.predicted} -> ${item.text}`
      );
    });
  } else {
    console.log("No misclassifications encountered during the run.");
  }
};

run().catch((error) => {
  console.error("Failed to execute sentiment stress test:", error.message);
  process.exit(1);
});
