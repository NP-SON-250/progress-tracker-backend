import multer from "multer";
import path from "path";

const fileUpload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".gif" &&
      ext !== ".tif" &&
      ext !== ".webp" &&
      ext !== ".bmp" &&
      ext !== ".tiff" &&
      ext !== ".avif" &&
      ext !== ".heif" &&
      ext !== ".heic" &&
      ext !== ".ico" &&
      ext !== ".svg" &&
      ext !== ".eps" &&
      ext !== ".pdf" &&
      ext !== ".ai" &&
      ext !== ".cdr" &&
      ext !== ".raw" &&
      ext !== ".cr2" &&
      ext !== ".nef" &&
      ext !== ".arw" &&
      ext !== ".psd" &&
      ext !== ".xcf" &&
      ext !== ".dng"
    ) {
      return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
  },
});

export default fileUpload;
