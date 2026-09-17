const express = require('express');
const {
  listForService, listMine, create, remove
} = require('../controllers/reviews.controller');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Public — anyone can see service reviews
router.get('/service/:serviceId', listForService);

// Customer actions
router.get('/my', authRequired, listMine);
router.post('/', authRequired, create);
router.delete('/:id', authRequired, remove);

module.exports = router;