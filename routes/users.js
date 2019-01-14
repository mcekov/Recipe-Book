const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

// Load user model
require('../models/User');
const User = mongoose.model('users');

// User login route
router.get('/login', function(req, res) {
  res.render('users/login');
});

// User register route
router.get('/register', function(req, res) {
  res.render('users/register');
});

// Login form post
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Register form post
router.post('/register', function(req, res) {
  let errors = [];
  let password = req.body.password;
  let password2 = req.body.password2;

  if (password !== password2) {
    errors.push({ text: 'Passwords do not match' });
  }

  if (password.length < 4) {
    errors.push({ text: 'Password must be at least 4 characters' });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      errors: errors,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        req.flash('error_msg', 'Email already registered!');
        res.redirect('/users/register');
      } else {
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in.'
                );
                res.redirect('/users/login');
              })
              .catch(err => {
                console.log(err);
                return;
              });
          });
        });
      }
    });
  }
});

// Logout user
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out.');
  res.redirect('/users/login');
});

module.exports = router;
