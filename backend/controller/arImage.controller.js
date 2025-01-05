import ARImage from "../models/arImage.model.js";

export const uploadARImage = async (req, res) => {
    try {
      const { _studentID } = req.body;
  
      if (!_studentID) {
        return res.status(400).json({ success: false, message: "Student ID is required." });
      }
  
      const newARImage = new ARImage({
        _studentID,
        _arImage: req.file.filename,
        _contentType: req.file.mimetype,
      });
  
      await newARImage.save();
      res.status(201).json({ success: true, message: "AR image uploaded successfully." });
    } catch (error) {
      console.error("Error uploading AR image:", error.message);
      res.status(500).json({ success: false, message: "Server error." });
    }
  };

export const getARImage = async (req, res) => {
  try {
    const { _studentID } = req.params;

    if (!_studentID) {
      return res.status(400).json({ success: false, message: "Student ID is required." });
    }

    const arImage = await ARImage.findOne({ _studentID });

    if (!arImage) {
      return res.status(404).json({ success: false, message: "AR image not found." });
    }

    res.set("Content-Type", arImage._contentType);
    res.set("Content-Disposition", `attachment; filename="ar-image.${arImage._contentType.split("/")[1]}"`);
    res.send(arImage._arImage);
  } catch (error) {
    console.error("Error getting AR image:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};