const express = require('express');
const { listMine, add, remove } = require('../controllers/wishlist.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);
router.get('/', listMine);
router.post('/', add);
router.delete('/:serviceId', remove);

module.exports = router;