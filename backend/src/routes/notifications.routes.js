const express = require('express');
const {
  listMine, unreadCount, markRead, markAllRead, remove
} = require('../controllers/notifications.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/', listMine);
router.get('/unread-count', unreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/:id', remove);

module.exports = router;