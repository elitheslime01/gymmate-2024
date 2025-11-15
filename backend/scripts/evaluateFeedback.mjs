import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import { classifyFeedback } from "../utils/sentimentAnalyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const DEFAULT_LIMIT = 50;

const toMessage = (doc) =>
  doc.message || doc._message || doc.comment || doc.feedback || "";

const run = async () => {
  const limitArg = Number(process.argv[2]);
  const limit = Number.isFinite(limitArg) && limitArg > 0 ? limitArg : DEFAULT_LIMIT;

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined. Please load your .env file.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const documents = await Feedback.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec();

  const results = [];
  for (const doc of documents) {
    const message = toMessage(doc);
    const sentiment = await classifyFeedback(message);
    results.push({
      id: doc._id?.toString?.() ?? "unknown",
      createdAt: doc.createdAt ?? doc._submittedAt ?? null,
      message,
      sentiment,
    });
  }

  const summary = results.reduce(
    (acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  console.table(results.map(({ id, createdAt, sentiment, message }) => ({
    id,
    createdAt: createdAt ? new Date(createdAt).toISOString() : "n/a",
    sentiment,
    message: message.slice(0, 120),
  })));

  console.log("\nSummary:", summary);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Failed to evaluate feedback sentiments:", error);
  mongoose.disconnect().finally(() => process.exit(1));
});
