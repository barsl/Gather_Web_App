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

function checkUsernameParam(req, res, next) {
  if (!validator.isAlphanumeric(req.params.username)) return res.status(400).json("Invalid username");
  next();
};

function checkEmail(req, res, next) {
  if (!validator.isEmail(req.body.email)) return res.status(400).json("Invalid email");
  req.body.email = validator.normalizeEmail(req.body.email);
  next();
}

function checkUsernameBody(req, res, next) {
  if (!validator.isAlphanumeric(req.body.username)) return res.status(400).end("Invalid username");
  next();
};

function checkId(req, res, next) {
  if (!validator.isAlphanumeric(req.params.id)) return res.status(400).end("Invalid user id");
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

router.route('/:username').get(checkUsernameParam, (req, res) => {
  User.find({ username: req.params.username })
    .then(user => {
      if (!user) return res.status(404).json("User not found")
      res.json(user)
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(checkUsernameBody, checkEmail, (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  User.find({ username }).then(() => res.status(409).json("user with this username already exists"));

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
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;