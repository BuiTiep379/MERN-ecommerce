const express = require('express');
const router = express.Router();

const upload = require('../../middleware/uploadImage');
const { authenticateUser } = require('../../middleware/authenticate');
const {
    signin,
    signup,
    signout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    showProfile,
    changePassword,
} = require('../../controllers/admin/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.delete('/signout', authenticateUser, signout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/show-profile', authenticateUser, showProfile)
router.patch('/update-profile', authenticateUser, upload.single('profilePicture'), updateProfile);
router.patch('/change-password', authenticateUser, changePassword);
module.exports = router;