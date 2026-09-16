const express = require('express');
const {
	dashboard, reportsSummary, listUsers, createUser, updateUser,
	listAppointments, updateAppointmentStatus,
	listServices, createService, updateService, deleteService,
	listSettings, upsertSetting
} = require('../controllers/admin.controller');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authRequired, requireRole('admin'));

router.get('/dashboard', dashboard);
router.get('/reports/summary', reportsSummary);
router.get('/users', listUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.get('/appointments', listAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/services', listServices);
router.post('/services', createService);
router.put('/services/:id', updateService);
router.delete('/services/:id', deleteService);
router.get('/settings', listSettings);
router.put('/settings/:key', upsertSetting);

module.exports = router;