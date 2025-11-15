import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const STOPWORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
  "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
  "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
  "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
  "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
  "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
  "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
  "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
  "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
  "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "can", "will", "just", "don", "should", "now",
  "ako", "ikaw", "siya", "kami", "kayo", "sila", "tayo", "niya", "nila", "namin", "natin",
  "ninyo", "kanila", "amin", "atin", "iyo", "inyo", "ito", "iyan", "iyon", "doon", "dito",
  "diyan", "roon", "rin", "din", "nga", "pa", "na", "ng", "nang", "sa", "ni", "kay", "para",
  "pero", "at", "o", "kung", "habang", "kapag", "pag", "kasi", "dahil", "upang", "ngunit",
  "subalit", "sapagkat", "palibhasa", "bago", "pagkatapos", "mula", "hanggang", "lamang",
  "lang", "mga", "may", "wala", "meron", "mayroon", "ba", "eh", "ho", "po", "si", "ang",
  "yung", "yong"
]);

const SENTIMENTS = ["positive", "neutral", "negative"];
const ALPHA = 1;

class NaiveBayesClassifier {
  constructor(alpha = ALPHA) {
    this.alpha = alpha;
    this.classes = new Set();
    this.classDocCounts = new Map();
    this.classWordTotals = new Map();
    this.wordCounts = new Map();
    this.vocab = new Set();
  }

  fit(documents, labels) {
    documents.forEach((tokens, index) => {
      const label = labels[index];
      if (!label || tokens.length === 0) {
        return;
      }

      if (!this.classes.has(label)) {
        this.classes.add(label);
        this.classDocCounts.set(label, 0);
        this.classWordTotals.set(label, 0);
        this.wordCounts.set(label, new Map());
      }

      this.classDocCounts.set(label, this.classDocCounts.get(label) + 1);

      const labelWordCounts = this.wordCounts.get(label);
      tokens.forEach((token) => {
        this.vocab.add(token);
        labelWordCounts.set(token, (labelWordCounts.get(token) || 0) + 1);
        this.classWordTotals.set(label, this.classWordTotals.get(label) + 1);
      });
    });
  }

  predict(tokens) {
    if (!tokens.length || this.classes.size === 0) {
      return "neutral";
    }

    const vocabSize = this.vocab.size || 1;
    const classCount = this.classes.size;
    const totalDocs = Array.from(this.classDocCounts.values()).reduce(
      (sum, value) => sum + value,
      0
    );
    const adjustedTotalDocs = totalDocs + this.alpha * classCount;

    let bestLabel = "neutral";
    let bestScore = Number.NEGATIVE_INFINITY;

    this.classes.forEach((label) => {
      const priorCount = (this.classDocCounts.get(label) || 0) + this.alpha;
      const totalWords = this.classWordTotals.get(label) || 0;
      const denominator = totalWords + this.alpha * vocabSize;
      const labelWordCounts = this.wordCounts.get(label) || new Map();

      let score = Math.log(priorCount / adjustedTotalDocs);

      tokens.forEach((token) => {
        const tokenCount = labelWordCounts.get(token) || 0;
        score += Math.log((tokenCount + this.alpha) / denominator);
      });

      if (score > bestScore) {
        bestScore = score;
        bestLabel = label;
      }
    });

    return bestLabel || "neutral";
  }
}

const preprocess = (text) => {
  if (!text || typeof text !== "string") {
    return [];
  }

  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !STOPWORDS.has(word));
};

const normalizeSentiment = (value) => {
  if (!value) {
    return null;
  }

  const normalized = value.toString().trim().toLowerCase();

  if (normalized.startsWith("pos")) {
    return "positive";
  }
  if (normalized.startsWith("neg")) {
    return "negative";
  }
  if (normalized.startsWith("neu")) {
    return "neutral";
  }

  return null;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATASET_PATH = path.resolve(
  __dirname,
  "../dataset/gymmate_feedback_dataset_extended.csv"
);

let model = null;
let trainingPromise = null;
let trainingFailed = false;

const readDatasetRows = () => {
  if (!fs.existsSync(DATASET_PATH)) {
    trainingFailed = true;
    console.warn(
      `[sentimentAnalyzer] Dataset not found at ${DATASET_PATH}. Unable to train Naive Bayes model.`
    );
    return Promise.resolve({ docs: [], labels: [] });
  }

  const docs = [];
  const labels = [];

  return new Promise((resolve) => {
    fs.createReadStream(DATASET_PATH)
      .pipe(csv())
      .on("data", (row) => {
        const feedbackText =
          row.Feedback || row.feedback || row.Comment || row.comment || row.Message || row.message;
        const sentimentLabel = row.Sentiment || row.sentiment;
        const normalizedLabel = normalizeSentiment(sentimentLabel);

        if (!feedbackText || !normalizedLabel) {
          return;
        }

        const tokens = preprocess(feedbackText);
        if (tokens.length === 0) {
          return;
        }

        docs.push(tokens);
        labels.push(normalizedLabel);
      })
      .on("end", () => resolve({ docs, labels }))
      .on("error", (error) => {
        trainingFailed = true;
        console.error("[sentimentAnalyzer] Failed to read dataset:", error.message);
        resolve({ docs: [], labels: [] });
      });
  });
};

const trainModelFromDataset = async () => {
  const { docs, labels } = await readDatasetRows();

  if (!docs.length || !labels.length) {
    trainingFailed = true;
    return null;
  }

  const classifier = new NaiveBayesClassifier();
  classifier.fit(docs, labels);
  model = classifier;
  trainingFailed = false;
  return model;
};

const ensureModel = async () => {
  if (model) {
    return model;
  }

  if (!trainingPromise) {
    trainingPromise = trainModelFromDataset();
  }

  return trainingPromise;
};

export const classifyFeedback = async (text) => {
  if (!text) {
    return "neutral";
  }

  const tokens = preprocess(text);
  if (!tokens.length) {
    return "neutral";
  }

  try {
    const classifier = await ensureModel();
    if (!classifier) {
      return "neutral";
    }

    const prediction = classifier.predict(tokens);
    if (!prediction || !SENTIMENTS.includes(prediction)) {
      return "neutral";
    }

    return prediction;
  } catch (error) {
    trainingFailed = true;
    console.error("[sentimentAnalyzer] Classification error:", error.message);
    return "neutral";
  }
};

export const recordSentimentTrainingSample = async () => Promise.resolve();

export const getSentimentTrainingStatus = () => ({
  ready: Boolean(model),
  failed: trainingFailed,
  datasetPath: DATASET_PATH,
  vocabSize: model ? model.vocab.size : 0,
  classes: model ? Array.from(model.classes) : [],
});