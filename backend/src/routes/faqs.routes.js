const express = require('express');
const { listActive } = require('../controllers/faqs.controller');

const router = express.Router();
router.get('/', listActive);

module.exports = router;