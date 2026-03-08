const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const Feedback = require('../models/Feedback');

router.post('/', verifyToken, requireRole('student'), async (req, res, next) => {
  try {
    const feedback = await Feedback.create({ ...req.body, studentId: req.user._id, messId: req.user.messId });
    res.status(201).json(feedback);
  } catch (err) { next(err); }
});

router.get('/', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const { date, meal } = req.query;
    const query = { messId: req.user.messId };
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: start, $lt: end };
    }
    if (meal) query.meal = meal;

    const feedback = await Feedback.find(query).sort({ createdAt: -1 }).populate('studentId', 'name rollNo');
    res.json(feedback);
  } catch (err) { next(err); }
});

router.get('/summary', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const summary = await Feedback.aggregate([
      { $match: { messId: req.user.messId } },
      {
        $group: {
          _id: '$meal',
          avgOverall: { $avg: '$overallRating' },
          avgTaste: { $avg: '$tasteRating' },
          avgPortion: { $avg: '$portionRating' },
          avgFreshness: { $avg: '$freshnessRating' },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(summary);
  } catch (err) { next(err); }
});

router.get('/recent', verifyToken, requireRole('staff'), async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ messId: req.user.messId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('studentId', 'name rollNo');
    res.json(feedback);
  } catch (err) { next(err); }
});

module.exports = router;
