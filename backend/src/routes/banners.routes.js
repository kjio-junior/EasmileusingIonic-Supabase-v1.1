const express = require('express');
const { listActive } = require('../controllers/banners.controller');

const router = express.Router();
router.get('/', listActive);

module.exports = router;