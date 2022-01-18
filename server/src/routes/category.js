const express = require('express');
const router = express.Router();
const { authenticateUser, authorizePermissions } = require('../middleware/authenticate');
const upload = require('../middleware/uploadImage');
const {
    createCategory,
    getCategories,
    updateCategories,
    deleteCategories,
} = require('../controllers/category');

router.post('/create', [authenticateUser, authorizePermissions('admin')], upload.single('categoryImage'), createCategory);
router.get('/get', getCategories);
router.patch('/update', [authenticateUser, authorizePermissions('admin')], updateCategories);
router.delete('/delete', [authenticateUser, authorizePermissions('admin')], deleteCategories);

module.exports = router;