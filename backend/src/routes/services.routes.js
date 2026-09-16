const express = require('express');
const { list, getOne } = require('../controllers/services.controller');

const router = express.Router();
router.get('/', list);
router.get('/:id', getOne);

module.exports = router;