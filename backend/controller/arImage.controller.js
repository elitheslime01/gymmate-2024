import ARImage from "../models/arImage.model.js";

const buildImageResponse = (doc) => {
  const base64 = doc._arImage.toString("base64");
  return {
    _id: doc._id,
    _studentId: doc._studentId,
    _contentType: doc._contentType,
    _arImage: base64,
    _dataUrl: `data:${doc._contentType};base64,${base64}`,
  };
};

export const uploadARImage = async (req, res) => {
  try {
    const { _studentId } = req.body;

    if (!_studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required." });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file is required." });
    }

    const payload = {
      _studentId,
      _arImage: req.file.buffer,
      _contentType: req.file.mimetype,
    };

    const existingImage = await ARImage.findOne({ _studentId });

    if (existingImage) {
      existingImage._arImage = payload._arImage;
      existingImage._contentType = payload._contentType;
      await existingImage.save();
      return res.status(200).json({
        success: true,
        message: "AR image updated successfully.",
        data: buildImageResponse(existingImage),
      });
    }

    const createdImage = await ARImage.create(payload);
    return res.status(201).json({
      success: true,
      message: "AR image uploaded successfully.",
      data: buildImageResponse(createdImage),
    });
  } catch (error) {
    console.error("Error uploading AR image:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getARImage = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "Student ID is required." });
    }

    const arImage = await ARImage.findOne({ _studentId: studentId });

    if (!arImage) {
      return res.status(404).json({ success: false, message: "AR image not found." });
    }

    res.status(200).json({
      success: true,
      data: buildImageResponse(arImage),
    });
  } catch (error) {
    console.error("Error getting AR image:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};