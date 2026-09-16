const express = require('express');
const multer = require('multer');
const {
  login, register, adminLogin, getProfile, updateProfile, uploadAvatar
} = require('../controllers/auth.controller');
const { authRequired } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, or WebP images allowed'));
    }
    cb(null, true);
  }
});

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/admin-login', adminLogin);
router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, updateProfile);
router.post('/profile/avatar', authRequired, upload.single('avatar'), uploadAvatar);

module.exports = router;