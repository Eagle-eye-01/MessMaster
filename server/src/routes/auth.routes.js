const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['staff', 'student']).withMessage('Role must be staff or student'),
], authController.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], authController.login);

router.post('/refresh', authController.refresh);
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.me);

module.exports = router;
