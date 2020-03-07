const router = require('express').Router();
const validator = require('validator');
const crypto = require('crypto');

let User = require('../models/user.model');

function generateSalt() {
  return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
  let hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return hash.digest('base64');
}

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  let salt = generateSalt();
  let saltedPassword = generateHash(password, salt);


  const newUser = new User({
    username,
    password: saltedPassword,
    salt,
    email,
    interests: [],
    friends: [],
    attendedEvents: []
  });

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;