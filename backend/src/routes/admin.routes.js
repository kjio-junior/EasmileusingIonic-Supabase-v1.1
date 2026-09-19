const express = require('express');
const {
  dashboard, listUsers, updateUser, createUser,
  listAppointments, updateAppointmentStatus, addTreatmentNotes,
  listPatients, getPatient, getPatientHistory,
  listServices, createService, updateService, deleteService,
  reportsSummary, listAuditLogs,
  listSettings, upsertSetting
} = require('../controllers/admin.controller');
const {
  listInventory, getHistory, updateStock, bulkUpdate
} = require('../controllers/inventory.controller');
const { listAll, toggleVerify, remove: deleteReview } = require('../controllers/reviews.controller');
const {
  listAll: listBanners, create: createBanner,
  update: updateBanner, remove: deleteBanner
} = require('../controllers/banners.controller');
const {
  listAll: listFaqs, create: createFaq,
  update: updateFaq, remove: deleteFaq
} = require('../controllers/faqs.controller');
const {
  listMine, unreadCount, markRead, markAllRead, remove: removeNotification,
  adminList, adminBroadcast
} = require('../controllers/notifications.controller');
const { authRequired, requireRole } = require('../middleware/auth');

const router = express.Router();

// Every route requires a valid token
router.use(authRequired);

// ============ ADMIN + STAFF + DENTIST ============

router.get('/dashboard',
  requireRole('admin', 'staff', 'dentist'),
  dashboard);

router.get('/appointments',
  requireRole('admin', 'staff', 'dentist'),
  listAppointments);

router.put('/appointments/:id/status',
  requireRole('admin', 'staff', 'dentist'),
  updateAppointmentStatus);

// Treatment notes — dentist and admin only
router.put('/appointments/:id/treatment-notes',
  requireRole('admin', 'dentist'),
  addTreatmentNotes);

router.get('/patients',
  requireRole('admin', 'staff', 'dentist'),
  listPatients);

router.get('/patients/:id',
  requireRole('admin', 'staff', 'dentist'),
  getPatient);

router.get('/patients/:id/history',
  requireRole('admin', 'staff', 'dentist'),
  getPatientHistory);

// Services — everyone reads, only admin writes
router.get('/services',
  requireRole('admin', 'staff', 'dentist'),
  listServices);

router.post('/services',
  requireRole('admin'),
  createService);

router.put('/services/:id',
  requireRole('admin'),
  updateService);

router.delete('/services/:id',
  requireRole('admin'),
  deleteService);

// Inventory — admin + staff
router.get('/inventory',
  requireRole('admin', 'staff'),
  listInventory);

router.get('/inventory/:serviceId/history',
  requireRole('admin', 'staff'),
  getHistory);

router.put('/inventory/:serviceId/stock',
  requireRole('admin', 'staff'),
  updateStock);

router.post('/inventory/bulk-update',
  requireRole('admin', 'staff'),
  bulkUpdate);

// ============ ADMIN ONLY ============

router.get('/notifications/mine', requireRole('admin', 'staff', 'dentist'), listMine);
router.get('/notifications/unread-count', requireRole('admin', 'staff', 'dentist'), unreadCount);
router.put('/notifications/read-all', requireRole('admin', 'staff', 'dentist'), markAllRead);
router.put('/notifications/:id/read', requireRole('admin', 'staff', 'dentist'), markRead);
router.delete('/notifications/:id', requireRole('admin', 'staff', 'dentist'), removeNotification);

router.get('/notifications', requireRole('admin'), adminList);
router.post('/notifications/broadcast', requireRole('admin'), adminBroadcast);

router.get('/users', requireRole('admin'), listUsers);
router.post('/users', requireRole('admin'), createUser);
router.put('/users/:id', requireRole('admin'), updateUser);

router.get('/reviews', requireRole('admin'), listAll);
router.put('/reviews/:id/verify', requireRole('admin'), toggleVerify);
router.delete('/reviews/:id', requireRole('admin'), deleteReview);

router.get('/banners', requireRole('admin'), listBanners);
router.post('/banners', requireRole('admin'), createBanner);
router.put('/banners/:id', requireRole('admin'), updateBanner);
router.delete('/banners/:id', requireRole('admin'), deleteBanner);

router.get('/faqs', requireRole('admin'), listFaqs);
router.post('/faqs', requireRole('admin'), createFaq);
router.put('/faqs/:id', requireRole('admin'), updateFaq);
router.delete('/faqs/:id', requireRole('admin'), deleteFaq);

router.get('/reports/summary', requireRole('admin'), reportsSummary);
router.get('/audit-logs', requireRole('admin'), listAuditLogs);

router.get('/settings', requireRole('admin'), listSettings);
router.put('/settings/:key', requireRole('admin'), upsertSetting);

module.exports = router;