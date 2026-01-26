import Feedback from "../models/feedback.model.js";

const STUDENT_SELECTION = "_fName _lName _umakEmail _umakID";

const toClientAttachment = (file) => {
  if (!file) {
    return null;
  }

  const base64 = file.data ? file.data.toString("base64") : null;

  return {
    _id: file._id,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    data: base64 ? `data:${file.mimetype};base64,${base64}` : null,
  };
};

const toClientStudent = (student) => {
  if (!student) {
    return null;
  }

  return {
    _id: student._id,
    firstName: student._fName,
    lastName: student._lName,
    email: student._umakEmail,
    umakId: student._umakID,
  };
};

const toClientFeedback = (doc) => {
  const plain = doc.toObject({ depopulate: false });

  const student = plain.student
    ? toClientStudent(plain.student)
    : plain._studentName || plain._studentEmail
    ? {
        _id: null,
        firstName: plain._studentName,
        lastName: null,
        email: plain._studentEmail,
        umakId: null,
      }
    : null;

  const attachments = (plain.attachments || []).map(toClientAttachment).filter(Boolean);

  const statusValue = (plain.status || plain._status || "new").toString().toLowerCase();

  return {
    _id: plain._id,
    student,
    category: plain.category || plain._category || "uncategorized",
    subcategory: plain.subcategory || plain._title || "general",
    message: plain.message || plain._message || "",
    attachments,
    status: statusValue,
    createdAt: plain.createdAt || plain._submittedAt || plain.created_at,
    updatedAt: plain.updatedAt || plain.updated_at,
  };
};

const buildDateQuery = (startDate, endDate) => {
  if (!startDate && !endDate) {
    return undefined;
  }

  const range = {};

  if (startDate) {
    range.$gte = new Date(startDate);
  }

  if (endDate) {
    range.$lte = new Date(endDate);
  }

  return range;
};

export const listFeedback = async (req, res) => {
  try {
  const { startDate, endDate, search, category, status, sentiment } = req.query;

    const query = {};

    const createdAt = buildDateQuery(startDate, endDate);
    if (createdAt) {
      query.createdAt = createdAt;
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const documents = await Feedback.find(query)
      .populate({ path: "student", select: STUDENT_SELECTION })
      .sort({ createdAt: -1 })
      .exec();

    let filtered = documents;

    if (search) {
      const regex = new RegExp(search, "i");
      filtered = documents.filter((doc) => {
        const values = [
          doc.message,
          doc.category,
          doc.subcategory,
          doc.sentiment,
          doc.status,
          doc._message,
          doc._category,
          doc._title,
          doc._sentiment,
          doc._status,
          doc.student?._fName,
          doc.student?._lName,
          doc.student?._umakEmail,
          doc.student?._umakID,
          doc._studentName,
          doc._studentEmail,
        ].filter(Boolean);

        return values.some((value) => regex.test(value));
      });
    }

    const dataWithSentiment = await Promise.all(
      filtered.map(async (doc) => {
        const base = toClientFeedback(doc);

        if (base.sentiment) {
          return base;
        }

        try {
          const computedSentiment = await classifyFeedback(base.message || "");
          return {
            ...base,
            sentiment: computedSentiment || null,
          };
        } catch (classificationError) {
          console.error(
            "Error classifying feedback sentiment during list:",
            classificationError.message
          );
          return {
            ...base,
            sentiment: base.sentiment || null,
          };
        }
      })
    );

    // Filter out non-English feedbacks (where sentiment is null)
    const englishOnlyData = dataWithSentiment.filter((item) => item.sentiment !== null);

    const finalData = sentiment
      ? englishOnlyData.filter((item) => item.sentiment === sentiment)
      : englishOnlyData;

    if (process.env.NODE_ENV !== "test") {
      finalData.forEach((item) => {
        const preview = (item.message || "").replace(/\s+/g, " ").trim();
        const truncated = preview.length > 120 ? `${preview.slice(0, 117)}...` : preview;
        console.log(
          `[feedback:list] ${truncated || "(no message provided)"} => ${
            item.sentiment || "neutral"
          }`
        );
      });
    }

    res.status(200).json({ success: true, data: finalData });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback." });
  }
};

const normalizeAttachmentPayload = (file) => {
  if (!file || !file.filename || !file.data) {
    return null;
  }

  let { mimetype, data, size } = file;
  let base64Payload = data;
  let detectedMime = mimetype;

  const dataUriPattern = /^data:(?<mime>.+);base64,(?<payload>.+)$/i;
  const match = typeof data === "string" ? data.match(dataUriPattern) : null;

  if (match && match.groups) {
    detectedMime = detectedMime || match.groups.mime;
    base64Payload = match.groups.payload;
  }

  if (!base64Payload || typeof base64Payload !== "string") {
    return null;
  }

  try {
    const buffer = Buffer.from(base64Payload, "base64");
    return {
      filename: file.filename,
      mimetype: detectedMime || "application/octet-stream",
      size: size ?? buffer.length,
      data: buffer,
    };
  } catch (error) {
    console.warn("Failed to parse attachment payload", error.message);
    return null;
  }
};

const normalizeStatus = (value) => {
  if (!value) {
    return "new";
  }
  const normalized = value.toString().toLowerCase();
  if (["new", "in_review", "resolved"].includes(normalized)) {
    return normalized;
  }
  return "new";
};

export const createFeedback = async (req, res) => {
  try {
    const body = req.body || {};

    const rawMessage = body.message || body._message || "";

    const payload = {
      student: body.student || body.studentId || body._student || null,
      category: (body.category || body._category || "").trim(),
      subcategory: (body.subcategory || body.title || body._title || "").trim(),
      message: typeof rawMessage === "string" ? rawMessage.trim() : "",
      status: normalizeStatus(body.status || body._status),
    };

    if (!payload.category || !payload.subcategory || !payload.message) {
      return res.status(400).json({
        success: false,
        message: "Category, subcategory, and message are required.",
      });
    }

    const rawAttachments = Array.isArray(body.attachments)
      ? body.attachments
      : Array.isArray(body._attachments)
      ? body._attachments
      : [];

    payload.attachments = rawAttachments
      .map(normalizeAttachmentPayload)
      .filter(Boolean);

    const feedback = await Feedback.create(payload);
    const populated = await feedback.populate({ path: "student", select: STUDENT_SELECTION });

    const data = toClientFeedback(populated);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ success: false, message: "Failed to create feedback." });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Feedback.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Feedback not found." });
    }

    res.status(200).json({ success: true, message: "Feedback removed." });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: "Failed to delete feedback." });
  }
};
