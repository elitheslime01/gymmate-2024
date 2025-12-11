import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Feedback from "../models/feedback.model.js";
import { classifyFeedback } from "../utils/sentimentAnalyzer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const checkAndFixSentiments = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    // Fetch all feedbacks
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    console.log(`Found ${feedbacks.length} feedbacks in the database\n`);

    if (feedbacks.length === 0) {
      console.log("No feedbacks to check.");
      await mongoose.disconnect();
      return;
    }

    console.log("Analyzing sentiments...\n");
    console.log("=".repeat(100));

    let correctCount = 0;
    let incorrectCount = 0;
    let missingCount = 0;
    let nonEnglishCount = 0;
    const updates = [];

    for (const feedback of feedbacks) {
      const message = feedback.message || "";
      const currentSentiment = feedback.sentiment;
      const computedSentiment = await classifyFeedback(message);

      // Truncate message for display
      const messagePreview = message.length > 60 
        ? message.substring(0, 57) + "..." 
        : message;

      console.log(`\nID: ${feedback._id}`);
      console.log(`Message: "${messagePreview}"`);
      console.log(`Current: ${currentSentiment || "NULL"}`);
      console.log(`Computed: ${computedSentiment || "NULL (non-English)"}`);

      if (computedSentiment === null) {
        // Non-English feedback
        nonEnglishCount++;
        console.log(`Status: ⚠️  NON-ENGLISH - Skipping`);
        if (currentSentiment !== null) {
          updates.push({
            _id: feedback._id,
            message: messagePreview,
            old: currentSentiment,
            new: null,
            reason: "Non-English text detected"
          });
        }
      } else if (!currentSentiment) {
        // Missing sentiment
        missingCount++;
        incorrectCount++;
        console.log(`Status: ❌ MISSING - Should be: ${computedSentiment}`);
        updates.push({
          _id: feedback._id,
          message: messagePreview,
          old: null,
          new: computedSentiment,
          reason: "Missing sentiment"
        });
      } else if (currentSentiment !== computedSentiment) {
        // Incorrect sentiment
        incorrectCount++;
        console.log(`Status: ❌ INCORRECT - Should be: ${computedSentiment}`);
        updates.push({
          _id: feedback._id,
          message: messagePreview,
          old: currentSentiment,
          new: computedSentiment,
          reason: "Incorrect sentiment"
        });
      } else {
        // Correct sentiment
        correctCount++;
        console.log(`Status: ✓ CORRECT`);
      }

      console.log("-".repeat(100));
    }

    console.log("\n" + "=".repeat(100));
    console.log("\nSUMMARY:");
    console.log(`Total Feedbacks: ${feedbacks.length}`);
    console.log(`Correct: ${correctCount}`);
    console.log(`Incorrect/Missing: ${incorrectCount}`);
    console.log(`Non-English: ${nonEnglishCount}`);
    console.log(`Needs Update: ${updates.length}`);

    if (updates.length === 0) {
      console.log("\n✓ All sentiments are correct! No updates needed.");
      await mongoose.disconnect();
      return;
    }

    console.log("\n\nFEEDBACKS THAT NEED UPDATES:");
    console.log("=".repeat(100));
    updates.forEach((update, index) => {
      console.log(`\n${index + 1}. ID: ${update._id}`);
      console.log(`   Message: "${update.message}"`);
      console.log(`   Current: ${update.old || "NULL"} → New: ${update.new || "NULL"}`);
      console.log(`   Reason: ${update.reason}`);
    });

    // Ask for confirmation
    console.log("\n" + "=".repeat(100));
    console.log(`\nDo you want to update these ${updates.length} feedbacks? (yes/no)`);
    
    // For automated execution, you can uncomment the following to auto-update:
    const shouldUpdate = true; // Change to false if you want manual confirmation
    
    if (shouldUpdate) {
      console.log("\nUpdating feedbacks...");
      
      let updatedCount = 0;
      for (const update of updates) {
        try {
          await Feedback.findByIdAndUpdate(
            update._id,
            {
              sentiment: update.new,
              sentimentSource: update.new ? "model" : null,
              sentimentUpdatedAt: new Date()
            },
            { new: true }
          );
          updatedCount++;
          console.log(`✓ Updated feedback ${update._id}`);
        } catch (error) {
          console.error(`✗ Failed to update feedback ${update._id}:`, error.message);
        }
      }

      console.log(`\n✓ Successfully updated ${updatedCount}/${updates.length} feedbacks`);
    } else {
      console.log("\nUpdate cancelled. No changes were made.");
    }

    await mongoose.disconnect();
    console.log("\n✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("\n✗ Error:", error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
};

checkAndFixSentiments();
