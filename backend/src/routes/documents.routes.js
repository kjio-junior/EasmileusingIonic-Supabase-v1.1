const express = require('express');
const multer = require('multer');
const {
  uploadDocument, listDocuments, deleteDocument
} = require('../controllers/documents.controller');
const { authRequired } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, WebP, or PDF allowed'));
    }
    cb(null, true);
  }
});

const router = express.Router();

router.post('/upload', authRequired, upload.single('file'), uploadDocument);
router.get('/', authRequired, listDocuments);
router.delete('/:id', authRequired, deleteDocument);

module.exports = router;