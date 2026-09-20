const express = require('express');
const { myAppointments, book, busySlots, payAppointment, getOne } = require('../controllers/appointments.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.get('/my-appointments', authRequired, myAppointments);
router.get('/busy-slots', authRequired, busySlots);
router.get('/:id', authRequired, getOne);
router.post('/book', authRequired, book);
router.post('/:id/pay', authRequired, payAppointment);

module.exports = router;