
const User = require('../models/auth-model.js');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

//Custom error handler to get useful error from database errors
const { errorHandler } = require('../helpers/dbErrorHandling.js');

//I will use it to send email sendgrid or nodemail
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.MAIL_KEY);


exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);

  //Validation to req, body we will create custom validation
  if(!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {
    User.findOne({
      email
    }).exec((err, user) => {
      //If user exists
      if(user) {
        return res.status(400).json({
          error: 'Email is taken'
        });
      }
    });

    //Generate Token
    const token = jwt.sign(
      {
        name,
        email,
        password
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: '15m'
      }
    )
    
    //Email data sending
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Account activation link',
      html: `
        <h1>Please Click the link to activate</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr/>
        <p>This email contains sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>
      `
    }

    sgMail
      .send(emailData)
      .then(sent => {
        return res.json({
          message: `Email has been sent to ${email}`
        });
      })
      .catch(err => {
        return res.status(400).json({
          success: false,
          error: errorHandler(err)
        })
      });
  }
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if(token) {
    //Verify the token is valid or not, or expired
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION,

      (err, decoded) => {

        if(err) {
          return res.status(401).json({
            error: 'Expired link. Signup again'
          });

        } else {
          //If valid save to db
          //Get name, email, password from token
          const { name, email, password } = jwt.decode(token);
      
          const user = new User({
            name,
            email,
            password
          });
      
          user.save((err, user) => {
            console.log(err);
            if(err) {
              return res.status(401).json({
                error: errorHandler(err)
              });
            } else {
              console.log(user);
              return res.json({
                success: true,
                user,
                message: 'Signup success'
              });
            }
          });
        }
      });
    } else {
      return res.json({
        message: 'error, please try again'
      });
    }
};
  
exports.loginController = (req, res) => {

const { email, password } = req.body;
const errors = validationResult(req);

if(!errors.isEmpty()) {
  const firstError = errors.array().map(error => error.msg)[0];
  return res.status(422).json({
    error: firstError
  });
} else {
  //Check if user exists
  User.findOne({
    email
  }).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'User with that email doesn\'t exist. Please Sign up.'
      });
    }
    
    // Authenticate
    if(!user.authenticate(password)) {
      return res.status(400).json({
        error: 'Email and password don\'t match'
      });
    }
    
    //Generate token
    const token = jwt.sign(
      {
        _id: user._id
      }, process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
      );
      
      const {_id, name, email, role } = user;
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role
        }
      });
    });
  }
};
    
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, //req.user._id
  algorithms: ['HS256']
});

exports.forgetController = (req, res) => {
  
  const { email } = req.body;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {
    User.findOne({
      email
    }).exec((err, user) => {
      if(err || !user) {
        return res.status(400).json({
          error: 'That email doesn\'t exist'
        });
      }

      //If exists
      //Generate token for user with this id valid for only 10 minutes
      const token = jwt.sign({
        _id: user._id
      }, process.env.JWT_RESET_PASSWORD, {
        expiresIn: '10m'
      });

      //Send email with this token
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Link',
        html: `
          <h1>Please Click the link to reset your password</h1>
          <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
          <hr/>
          <p>This email contain sensitive info</p>
          <p>${process.env.CLIENT_URL}</p>
        `
      }
      return user.updateOne({
        resetPasswordLink: token
      }, (err, success) => {
        if(err) {
          return res.status(400).json({
            error:errorHandler(err)
          });
        } else {
          //Send email
          sgMail.send(emailData)
            .then(sent => {
              return res.json({
                message: `Email has been sent to ${email}. Follow the instruction to activate your account.`
              });
          }).catch(err => {
            return res.json({
              message: err.message
            });
          });
        }
      });
    });
  }
  
}

exports.resetController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      error: firstError
    });
  } else {

    if(resetPasswordLink) {
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, 
        (err, decoded) => {
          if(err) {
            return res.status(400).json({
              error: 'Expired Link, try again'
            });
          }
          User.findOne({
            resetPasswordLink
          }).exec((err, user) => {
            if (err || !user) {
              return res.status(400).json({
                error: 'Something went wrong. Try later.'
              });
            }

            const updateFields = {
              password: newPassword,
              resetPasswordLink: ''
            };

            user = _.extend(user, updateFields);

            user.save((err, result) => {
              if(err) {
                return res.status(400).json({
                  error: 'Error resetting user password'
                });
              }

              res.json({
                message: 'Great! Now you can login with your new password!'
              });
            });
          });
        });
    }
  }

}


exports.adminMiddleware = (req, res, next) => {
  User.findById({
    _id: req.user._id
  }).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if(user.role != 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.'
      });
    }

    req.profile = user;
    next();
  });
}


