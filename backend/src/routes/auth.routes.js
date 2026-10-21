const express = require('express');
const multer = require('multer');
const {
  login, register, adminLogin, getProfile, updateProfile, uploadAvatar,
  forgotPassword, resetPassword, verifyEmail, resendVerification
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

router.post('/resend-code', authRequired, resendVerification);
router.post('/login', login);
router.post('/register', register);
router.post('/verify-email', authRequired, verifyEmail);
router.post('/admin-login', adminLogin);
router.get('/profile', authRequired, getProfile);
router.put('/profile', authRequired, updateProfile);
router.post('/profile/avatar', authRequired, upload.single('avatar'), uploadAvatar);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;