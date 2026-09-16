const express = require('express');
const { myAppointments, book, busySlots } = require('../controllers/appointments.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.get('/my-appointments', authRequired, myAppointments);
router.get('/busy-slots', authRequired, busySlots);
router.post('/book', authRequired, book);

module.exports = router;