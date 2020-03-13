const router = require('express').Router();
const validator = require('validator');
const crypto = require('crypto');
const cookie = require('cookie');
require('dotenv').config();

let User = require('../models/user.model');

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

router.route('/currentuser').get((req, res) => {
  //get user from session
  console.log("session username: " + req.session.username);

  if (req.session.username) {
    User.findOne({username: req.session.username.username})
    .then(user => {
      if (!user) return res.status(404).json("User not found")
      res.json(user)})
      .catch(err => res.status(400).json('Error: ' + err));
  }
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

module.exports = router;