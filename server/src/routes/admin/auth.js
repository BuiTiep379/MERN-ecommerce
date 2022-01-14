const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/authenticate');
const { signup, signin, signout, verifyEmail, forgotPassword, resetPassword } = require('../../controllers/admin/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.delete('/signout', authenticateUser, signout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/show-me', authenticateUser, (req, res) => console.log('tiep'))
module.exports = router;