const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOAD_DIR = path.join(__dirname, '../uploads');

function ensureUploadDir() {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (_) {
    // ignore
  }
}

ensureUploadDir();

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, name);
  }
});

function fileFilter(_req, file, cb) {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('INVALID_FILE_TYPE: Only image uploads are allowed.'), false);
  }
  cb(null, true);
}

const upload = multer({ storage, fileFilter });

exports.uploadMiddleware = upload.single('image');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'NO_FILE: image field is required.' });
    }
    const url = `/uploads/${req.file.filename}`;
    return res.json({ ok: true, data: { url } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `UPLOAD_FAILED: ${err.message}` });
  }
};
