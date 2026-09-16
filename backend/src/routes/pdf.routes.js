const express = require('express');
const { appointmentPdf } = require('../controllers/pdf.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.get('/appointments/:id/pdf', authRequired, appointmentPdf);

module.exports = router;