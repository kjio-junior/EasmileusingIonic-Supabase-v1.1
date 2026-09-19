const express = require('express');
const { submit } = require('../controllers/contact.controller');

const router = express.Router();

// Public — no auth required so guests can also send messages
router.post('/', submit);

module.exports = router;