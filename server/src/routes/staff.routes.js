const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const Staff = require('../models/Staff');

router.use(verifyToken, requireRole('staff'));

router.get('/', async (req, res, next) => {
  try {
    const staff = await Staff.find({ messId: req.user.messId, isActive: true });
    res.json(staff);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const member = await Staff.create({ ...req.body, messId: req.user.messId });
    res.status(201).json(member);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const member = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ error: 'Staff not found' });
    res.json(member);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Staff deactivated' });
  } catch (err) { next(err); }
});

module.exports = router;
