import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
  errorHandling: (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Error uploading file' });
  },
});

export default upload;