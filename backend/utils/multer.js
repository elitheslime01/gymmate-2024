import multer from 'multer';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve('./public/images'));
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}`;
      cb(null, uniqueName + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
  errorHandling(req, res, next) {
    if (req.fileValidationError) {
      console.error(req.fileValidationError.message);
      return res.status(400).send({ message: req.fileValidationError.message });
    }
    next();
  },
});

export default upload;