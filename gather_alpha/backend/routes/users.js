const router = require('express').Router();
const validator = require('validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let User = require('../models/user.model');

function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('base64');
}

function checkEmail(req, res, next) {
  if (!validator.isEmail(req.body.email)) return res.status(400).json("Invalid email");
  req.body.email = validator.normalizeEmail(req.body.email);
  next();
}

function checkId(req, res, next) {
  if (!validator.isAlphanumeric(req.params.id)) return res.status(400).json("Invalid user id");
  req.params.id = validator.trim(req.params.id);
  req.params.id = validator.escape(req.params.id);
  next();
};

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get(checkId, (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) return res.status(404).json("User not found")
      res.json(user)
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:username').get((req, res) => {
  User.find({ username: req.params.username })
    .then(user => {
      if (!user) return res.status(404).json("User not found")
      res.json(user)
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(checkEmail, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ email }).then(user => {
    if (user) return res.status(409).json("User with this email already exists");

    let salt = generateSalt();
    let saltedPassword = generateHash(password, salt);

    const newUser = new User({
      username,
      password: saltedPassword,
      salt,
      email,
      interests: [],
      friends: [],
      friend_requests: [],
      invitedEvents: [],
      attendingEvents: [],
      history: [],
    });

    newUser.save()
      .then(savedUser => {
        req.session.username = user;

        res.setHeader('Set-Cookie', cookie.serialize('username', user.username), {
          path: '/',
          maxAge: process.env.SESS_LIFETIME
        })
      });
  });
});

module.exports = router;