const router = require('express').Router();
let User = require('../models/user.model');
const auth = require('../middleware/auth');
require('dotenv').config();

var mongoose = require('mongoose');

// add request from current user to user with 'id'
router.route('/requests/add/:id').post(auth, (req, res) => {
  if (req.body.req !== req.session.user.id) {
    return res.status(403).end();
  }
  User.findById(req.params.id)
    .then(user => {
      console.log(req.body.req);
      user.friend_requests = user.friend_requests.concat(
        mongoose.Types.ObjectId(req.body.req)); 
      user.save()
        .then(() => res.json("Request sent!"))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// add body.req._id to friends of params.id._id
router.route('/friends/add/:id').post(auth, (req, res) => {
  if (req.params.id !== req.session.user.id) {
    return res.status(403).end();
  }
  User.findById(req.params.id)
    .then(user => {
      user.friends = user.friends.concat(
        mongoose.Types.ObjectId(req.body.target)); 
      user.save()
        .then(() => res.json("Request sent!"))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});


// remove body.req.traget from friend requests of params.id
router.route('/friends/delete/:id').post(auth, (req, res) => {
  if (req.params.id !== req.session.user.id) {
    return res.status(403).end();
  }
  User.findByIdAndUpdate(req.params.id, 
    { $pull: { friends: req.body.target } }).exec()
    .catch(err => res.status(400).json('cant delete: ' + err));
});

// remove body.req.traget from friend requests of params.id
router.route('/requests/delete/:id').post(auth, (req, res) => {
  if (req.params.id !== req.session.user.id) {
    return res.status(403).end();
  }
  User.findByIdAndUpdate(req.params.id, 
    { $pull: { friend_requests: req.body.target } }).exec()
    .catch(err => res.status(400).json('cant delete: ' + err));
});


module.exports = router;