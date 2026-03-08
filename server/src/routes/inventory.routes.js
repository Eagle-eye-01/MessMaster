const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const Inventory = require('../models/Inventory');
const EnergyLog = require('../models/EnergyLog');

router.use(verifyToken, requireRole('staff'));

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { messId: req.user.messId };
    if (category) query.category = category;
    const items = await Inventory.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await Inventory.create({ ...req.body, messId: req.user.messId });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) { next(err); }
});

router.get('/low-stock', async (req, res, next) => {
  try {
    const items = await Inventory.find({ messId: req.user.messId, $expr: { $lte: ['$qty', '$minQty'] } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/energy-log', async (req, res, next) => {
  try {
    const log = new EnergyLog({ ...req.body, messId: req.user.messId, loggedBy: req.user._id });
    await log.save();
    res.status(201).json(log);
  } catch (err) { next(err); }
});

router.get('/energy-summary', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todayLog] = await EnergyLog.find({ messId: req.user.messId, date: { $gte: today } }).sort({ date: -1 }).limit(1);
    const mtdLogs = await EnergyLog.find({ messId: req.user.messId, date: { $gte: monthStart } });

    const mtd = mtdLogs.reduce((acc, l) => ({
      gasKg: acc.gasKg + l.gasKg,
      electricityKwh: acc.electricityKwh + l.electricityKwh,
      gasCost: acc.gasCost + l.gasCost,
      electricityCost: acc.electricityCost + l.electricityCost,
    }), { gasKg: 0, electricityKwh: 0, gasCost: 0, electricityCost: 0 });

    res.json({ today: todayLog || null, mtd });
  } catch (err) { next(err); }
});

module.exports = router;
