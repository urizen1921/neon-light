const express = require('express');
const router = express.Router();

const { requireSignin, adminMiddleware } = require('../controllers/auth-controller.js');
const { readController, updateController } = require('../controllers/user-controller.js');

router.get('/user/:id', requireSignin, readController);
router.put('/user/update', requireSignin, updateController);
router.put('/admin/update', requireSignin, adminMiddleware, updateController);

module.exports = router;