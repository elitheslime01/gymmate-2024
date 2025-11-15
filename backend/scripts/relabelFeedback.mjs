import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import { classifyFeedback } from "../utils/sentimentAnalyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const ALLOWED = new Set(["positive", "neutral", "negative"]);
const normalizeSentiment = (value) => {
  if (!value) {
    return null;
  }
  const normalized = value.toString().trim().toLowerCase();
  if (ALLOWED.has(normalized)) {
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

const toMessage = (doc) =>
  doc.message || doc._message || doc.comment || doc.feedback || "";

const run = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("Missing Mongo connection string (MONGODB_URI / MONGO_URI).");
    process.exit(1);
  }

  const dryRun = process.argv.includes("--dry-run") || process.argv.includes("--preview");

  await mongoose.connect(mongoUri);

  try {
    const documents = await Feedback.find().sort({ createdAt: -1 }).lean().exec();
    if (!documents.length) {
      console.log("No feedback documents found to evaluate.");
      return;
    }

    const mislabels = [];
    const unlabeled = [];
    const unchanged = [];

    for (const doc of documents) {
      const message = toMessage(doc);
      if (!message) {
        continue;
      }

      const predicted = await classifyFeedback(message);
      const current = normalizeSentiment(doc.sentiment);

      if (!ALLOWED.has(predicted)) {
        continue;
      }

      if (!current) {
        unlabeled.push({ id: doc._id, predicted, message });
        continue;
      }

      if (current === predicted) {
        unchanged.push({ id: doc._id, predicted, message });
        continue;
      }

      mislabels.push({
        id: doc._id,
        previous: current,
        predicted,
        message,
      });
    }

    console.log(`Total evaluated: ${documents.length}`);
    console.log(`Up to date: ${unchanged.length}`);
    console.log(`Unlabeled: ${unlabeled.length}`);
    console.log(`Mislabels detected: ${mislabels.length}`);

    if (mislabels.length) {
      console.log("\nMislabels preview (first 10):");
      mislabels.slice(0, 10).forEach((item) => {
        console.log(
          `- ${item.id}: ${item.previous} -> ${item.predicted} | ${item.message.slice(0, 120)}`
        );
      });
    }

    if (unlabeled.length) {
      console.log("\nUnlabeled feedback preview (first 10):");
      unlabeled.slice(0, 10).forEach((item) => {
        console.log(`- ${item.id}: set to ${item.predicted} | ${item.message.slice(0, 120)}`);
      });
    }

    if (dryRun) {
      console.log("\nDry run enabled: no database changes were applied.");
      return;
    }

    const updates = [];
    const now = new Date();

    unlabeled.forEach((item) => {
      updates.push({
        updateOne: {
          filter: { _id: item.id },
          update: {
            $set: {
              sentiment: item.predicted,
              sentimentSource: "model",
              sentimentUpdatedAt: now,
            },
          },
        },
      });
    });

    mislabels.forEach((item) => {
      updates.push({
        updateOne: {
          filter: { _id: item.id },
          update: {
            $set: {
              sentiment: item.predicted,
              sentimentSource: "model",
              sentimentUpdatedAt: now,
            },
          },
        },
      });
    });

    if (updates.length === 0) {
      console.log("\nNo sentiment updates required.");
      return;
    }

    const result = await Feedback.bulkWrite(updates, { ordered: false });
    console.log("\nSentiment updates applied:", result.modifiedCount);
  } catch (error) {
    console.error("Failed to relabel feedback:", error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

run().catch((error) => {
  console.error("Unexpected failure while relabeling feedback:", error.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
