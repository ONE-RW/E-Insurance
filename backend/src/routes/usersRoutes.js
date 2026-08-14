const express = require('express');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireRole } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  listUsers, createUser, updateUser, updateUserStatus, updateUserPassword,
  updateMe, updateMyPassword, updateMyAvatar
} = require('../controllers/usersController');
const {
  createUserValidator, updateUserValidator, statusValidator, passwordValidator,
  updateMeValidator, changeMyPasswordValidator
} = require('../validators/usersValidators');

const router = express.Router();

const meActionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, try again later' });
  }
});

// Self-service routes: any authenticated user (admin/insurer/officer) acting on their own
// account. Registered before the blanket admin-only middleware below and before the
// "/:id" routes so Express doesn't parse "me" as an :id and so these aren't role-gated.
router.put('/me', requireAuth, updateMeValidator, updateMe);
router.patch('/me/password', meActionsLimiter, requireAuth, changeMyPasswordValidator, updateMyPassword);
router.post('/me/avatar', meActionsLimiter, requireAuth, uploadAvatar, updateMyAvatar);

router.use(requireAuth, requireRole(['admin']));

router.get('/', listUsers);
router.post('/', createUserValidator, createUser);
router.put('/:id', updateUserValidator, updateUser);
router.patch('/:id/status', statusValidator, updateUserStatus);
router.patch('/:id/password', passwordValidator, updateUserPassword);

module.exports = router;
