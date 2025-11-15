import express from "express";
import multer from "multer";
import { uploadARImage, getARImage } from "../controller/arImage.controller.js";

const router = express.Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (file.mimetype.startsWith("image/")) {
			return callback(null, true);
		}
		callback(new Error("Only image uploads are allowed."));
	},
});

const handleUpload = (req, res, next) => {
	upload.single("_arImage")(req, res, (err) => {
		if (err) {
			return res.status(400).json({ success: false, message: err.message });
		}
		next();
	});
};

router.post("/upload", handleUpload, uploadARImage);
router.get("/:studentId", getARImage);

const arImageRoutes = router;

export default arImageRoutes;