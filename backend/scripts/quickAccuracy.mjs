import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import { classifyFeedback } from "../utils/sentimentAnalyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const LABELS = ["positive", "neutral", "negative"];
const normalizeLabel = (value) => {
  if (!value) {
    return null;
  }
  const normalized = value.toString().trim().toLowerCase();
  if (LABELS.includes(normalized)) {
    return normalized;
  }
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

const buildMatrix = () =>
  LABELS.reduce((acc, expected) => {
    acc[expected] = LABELS.reduce((row, predicted) => {
      row[predicted] = 0;
      return row;
    }, {});
    return acc;
  }, {});

const toMessage = (doc) =>
  doc.message || doc._message || doc.comment || doc.feedback || "";

const calcMetrics = (matrix) => {
  const perClass = LABELS.map((label) => {
    const tp = matrix[label][label];
    const fp = LABELS.reduce((sum, expected) => {
      if (expected === label) {
        return sum;
      }
      return sum + matrix[expected][label];
    }, 0);

    const fn = LABELS.reduce((sum, predicted) => {
      if (predicted === label) {
        return sum;
      }
      return sum + matrix[label][predicted];
    }, 0);

    const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
    const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);

    return { label, tp, fp, fn, precision, recall, f1 };
  });

  const macroPrecision = perClass.reduce((sum, row) => sum + row.precision, 0) / LABELS.length;
  const macroRecall = perClass.reduce((sum, row) => sum + row.recall, 0) / LABELS.length;
  const macroF1 = perClass.reduce((sum, row) => sum + row.f1, 0) / LABELS.length;

  return { perClass, macroPrecision, macroRecall, macroF1 };
};

const run = async () => {
  const limitArg = process.argv[2];
  const numericLimit = Number(limitArg);
  const useAll = typeof limitArg === "string" && limitArg.toLowerCase() === "all";
  const limit = Number.isFinite(numericLimit) && numericLimit > 0 ? numericLimit : 50;

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Missing Mongo connection string (MONGODB_URI / MONGO_URI).");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  try {
    const finder = Feedback.find({ sentiment: { $in: LABELS } })
      .sort({ createdAt: -1 })
      .lean();

    if (!useAll) {
      finder.limit(limit);
    }

    const documents = await finder.exec();

    if (!documents.length) {
      console.error("No labeled feedback documents found to evaluate.");
      return;
    }

    const matrix = buildMatrix();
    let correct = 0;

    for (const doc of documents) {
      const expected = normalizeLabel(doc.sentiment);
      if (!expected) {
        continue;
      }

      const predicted = await classifyFeedback(toMessage(doc));
      if (!LABELS.includes(predicted)) {
        continue;
      }

      matrix[expected][predicted] += 1;
      if (predicted === expected) {
        correct += 1;
      }
    }

    const total = documents.length;
    const accuracy = total === 0 ? 0 : correct / total;
    const metrics = calcMetrics(matrix);

    console.log("Quick Accuracy Report");
    console.log(`Samples evaluated: ${total}`);
    if (useAll) {
      console.log("Mode: evaluated the entire labeled dataset (no limit).");
    }
    console.log(`Accuracy: ${(accuracy * 100).toFixed(2)}%`);

    console.log("\nConfusion Matrix (expected → predicted):");
    console.table(matrix);

    console.log("Class metrics:");
    console.table(
      metrics.perClass.map((row) => ({
        Label: row.label,
        TP: row.tp,
        FP: row.fp,
        FN: row.fn,
        Precision: row.precision.toFixed(2),
        Recall: row.recall.toFixed(2),
        F1: row.f1.toFixed(2),
      }))
    );

    console.log("Macro precision:", metrics.macroPrecision.toFixed(2));
    console.log("Macro recall:", metrics.macroRecall.toFixed(2));
    console.log("Macro F1:", metrics.macroF1.toFixed(2));
  } catch (error) {
    console.error("Failed to compute quick accuracy:", error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run().catch((error) => {
  console.error("Unexpected failure in quick accuracy run:", error.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
