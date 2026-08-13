const fs = require('fs');
const path = require('path');
const multer = require('multer');

const AVATAR_DIR = path.resolve(__dirname, '../../uploads/avatars');
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `user-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, and WEBP images are allowed'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

function uploadAvatar(req, res, next) {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        err.message = 'File is too large. Maximum size is 2MB';
      }
      err.status = 400;
      return next(err);
    }
    return next();
  });
}

module.exports = { uploadAvatar, AVATAR_DIR };
