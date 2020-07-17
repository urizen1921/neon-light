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
  activationController 
} = require('../controllers/auth-controller.js');

router.post('/register', validRegister, registerController);
//router.post('/activation', activationController);

module.exports = router;