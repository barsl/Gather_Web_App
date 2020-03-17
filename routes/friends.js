const router = require('express').Router();
let User = require('../models/user.model');
require('dotenv').config();

var mongoose = require('mongoose');

// add request from current user to user with 'id'
router.route('/requests/add/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(user => {
      console.log(req.body.req);
      user.friend_requests = user.friend_requests.concat(
        mongoose.Types.ObjectId(req.body.req)); // req.session.user.username
      user.save()
        .then(() => res.json("Request sent!"))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// add body.req._id to params.id._id
router.route('/friends/add/:id').post((req, res) => {
  User.findById(req.params.id)
    .then(user => {
      console.log(req.body.target);
      user.friends = user.friends.concat(
        mongoose.Types.ObjectId(req.body.target)); // req.session.user.username
      user.save()
        .then(() => res.json("Request sent!"))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});



module.exports = router;