import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

// --- MongoDB Schema ---
const feedbackSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  feedback_text: { type: String, required: true },
  sentiment_label: { type: String, enum: ["Positive", "Negative"], required: true },
  createdAt: { type: Date, default: Date.now }
});
const Feedback = mongoose.model("Feedback", feedbackSchema);

// --- Stopwords ---
const STOPWORDS = new Set([
  // English stopwords
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
  // Tagalog stopwords
  "ako", "ikaw", "siya", "kami", "kayo", "sila", "tayo", "niya", "nila", "namin", "natin",
  "ninyo", "kanila", "amin", "atin", "iyo", "inyo", "ito", "iyan", "iyon", "doon", "dito",
  "diyan", "roon", "rin", "din", "nga", "pa", "na", "ng", "nang", "sa", "ni", "kay", "para",
  "pero", "at", "o", "kung", "habang", "kapag", "pag", "kasi", "dahil", "upang", "ngunit",
  "subalit", "sapagkat", "palibhasa", "bago", "pagkatapos", "mula", "hanggang", "lamang",
  "lang", "mga", "may", "wala", "meron", "mayroon", "ba", "eh", "ho", "po", "si", "ang",
  "yung", "yong", "yung", "yung", "yong", "yung", "yong", "yung", "yong", "yung", "yong"
]);

function preprocess(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(word => word && !STOPWORDS.has(word));
}

// --- TF-IDF Vectorizer ---
class TfIdfVectorizer {
  constructor() {
    this.vocab = [];
    this.idf = {};
  }
  fit(docs) {
    const df = {};
    docs.forEach(doc => {
      const words = new Set(doc);
      words.forEach(word => {
        df[word] = (df[word] || 0) + 1;
      });
    });
    this.vocab = Object.keys(df);
    const N = docs.length;
    this.vocab.forEach(word => {
      this.idf[word] = Math.log(N / (1 + df[word]));
    });
  }
  transform(doc) {
    const tf = {};
    doc.forEach(word => {
      tf[word] = (tf[word] || 0) + 1;
    });
    const vec = this.vocab.map(word => (tf[word] || 0) * this.idf[word]);
    return vec;
  }
}

// --- Naive Bayes Classifier ---
class NaiveBayes {
  constructor() {
    this.classes = [];
    this.classWordCounts = {};
    this.classDocCounts = {};
    this.vocab = new Set();
    this.classTotals = {};
  }
  fit(X, y) {
    this.classes = Array.from(new Set(y));
    this.classes.forEach(cls => {
      this.classWordCounts[cls] = {};
      this.classDocCounts[cls] = 0;
      this.classTotals[cls] = 0;
    });
    X.forEach((doc, i) => {
      const cls = y[i];
      this.classDocCounts[cls]++;
      doc.forEach(word => {
        this.vocab.add(word);
        this.classWordCounts[cls][word] = (this.classWordCounts[cls][word] || 0) + 1;
        this.classTotals[cls]++;
      });
    });
  }
  predict(doc) {
    const scores = {};
    this.classes.forEach(cls => {
      let logProb = Math.log(this.classDocCounts[cls] / Object.values(this.classDocCounts).reduce((a, b) => a + b));
      doc.forEach(word => {
        const count = this.classWordCounts[cls][word] || 0;
        logProb += Math.log((count + 1) / (this.classTotals[cls] + this.vocab.size));
      });
      scores[cls] = logProb;
    });
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }
}

// --- Load CSV Dataset and Train Model ---
// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const csvPath = "../dataset/gymmate_feedback_dataset_extended.csv";

let vectorizer, nb;
async function trainModelFromCSV() {
  return new Promise((resolve, reject) => {
    const docs = [];
    const labels = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        // Use correct column names from your CSV
        if (row.Feedback && row.Sentiment) {
          docs.push(preprocess(row.Feedback));
          labels.push(row.Sentiment.charAt(0).toUpperCase() + row.Sentiment.slice(1).toLowerCase()); // Capitalize for consistency
        }
      })
      .on("end", () => {
        vectorizer = new TfIdfVectorizer();
        vectorizer.fit(docs);
        nb = new NaiveBayes();
        nb.fit(docs, labels);
        console.log("Model trained successfully from CSV.");
        resolve();
      })
      .on("error", reject);
  });
}

// Function to classify text
function classifyText(text) {
  if (!nb) {
    throw new Error("Model not trained yet!");
  }
  const tokens = preprocess(text);
  return nb.predict(tokens);
}

// Run the example
async function main() {
  try {
    await trainModelFromCSV();
    
    // Example texts to classify
      const examples = [
      "Hindi ako makapasok sa gymmate, lagi akong nasa queue",
      "Hindi ako makapagbook ng slot sa gymmate"
    ];

    // Classify each example
    examples.forEach(text => {
      const sentiment = classifyText(text);
      console.log(`Text: "${text}"\nSentiment: ${sentiment}\n`);
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Run the program
main();