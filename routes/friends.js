const router = require('express').Router();
let User = require('../models/user.model');
require('dotenv').config();

const barsl = "5e63e0a7a20ecb641223533b";

router.route('/reqs/:id').get((req, res) => {
  User.findById(barsl) // req.session.user._id
    .then(user => res.json(user["friend_requests"]))
    .catch(err => res.status(400).json('Error: ' + err));
});

// get a list of friends of user with id 'id'
router.route('/list').get((req, res) => {
  console.log(req.session.username.username);
  User.findById(barsl) // req.session.user._id
    .then(user => res.json(user["friends"]))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(user => {
      user.friend_requests = req.body.req.concat("barsl"); // req.session.user.username
      user.save()
        .then(user2 => res.json(user2.friend_requests))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


module.exports = router;