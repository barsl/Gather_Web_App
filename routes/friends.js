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
      console.log(req.session);
      user.friend_requests = user.friend_requests.concat(req.session.username._id); // req.session.user.username
      user.save()
        .then(() => res.json("Request sent!"))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// router.route('/requests').get(auth, (req, res) => {
//   User.findOne({username: req.session.username.username})
//     .populate('friend_requests')
//     .then(user => {
//       if (!user) return res.status(404).json("User not found")
//       res.json(user.invitedEvents);
//     })
//     .catch(err => res.status(400).json('Error: ' + err));
// });

// router.route('/friends').get(auth, (req, res) => {
//   User.findOne({username: req.session.username.username})
//     .populate('friends')
//     .then(user => {
//       if (!user) return res.status(404).json("User not found")
//       res.json(user.friends);
//     })
//     .catch(err => res.status(400).json('Error: ' + err));
// });

module.exports = router;