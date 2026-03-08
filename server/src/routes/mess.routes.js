const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const messController = require('../controllers/mess.controller');

router.use(verifyToken);
router.post('/', requireRole('staff'), messController.create);
router.get('/:id', messController.getById);
router.put('/:id', requireRole('staff'), messController.update);
router.get('/:id/dashboard-summary', messController.dashboardSummary);

module.exports = router;
