const express = require('express');
const router = express.Router();

//Validation
const {
  validRegister,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../helpers/valid.js')


//Load Controllers
const { 
  registerController,
  activationController,
  loginController,
  forgetController,
  resetController
} = require('../controllers/auth-controller.js');

const { validationResult } = require('express-validator');

router.post('/register', validRegister, registerController);
router.post('/login', validLogin, loginController);
router.post('/activation', activationController);
router.put('/password/forget', forgotPasswordValidator, forgetController);
router.put('/password/reset', resetPasswordValidator, resetController);



module.exports = router;