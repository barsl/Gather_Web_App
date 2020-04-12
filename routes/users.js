const router = require('express').Router();
const validator = require('validator');
const auth = require('../middleware/auth');
const {google} = require('googleapis');
const userInterests = require('../util/constants/userInterests.js');
const withGoogleOAuth2 = require('../middleware/withGoogleOAuth2');
const {
  checkEventPermissions,
  stripCredentials,
  userExistsInCollection,
} = require('../util/functions/UserUtil');
const mongoose = require('mongoose');
require('dotenv').config();

let User = require('../models/user.model');
let Event = require('../models/event.model');

function checkId(req, res, next) {
  if (!validator.isAlphanumeric(req.params.id))
    return res.status(400).json('Invalid user id');
  req.params.id = validator.trim(req.params.id);
  req.params.id = validator.escape(req.params.id);
  next();
}

router.route('/').get(auth, (req, res) => {
  User.find({}, {password: 0, salt: 0})
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/currentUser').get(auth, (req, res) => {
  //get user from session
  if (req.session.user) {
    User.findOne({username: req.session.user.username}, {password: 0, salt: 0})
      .populate('friends')
      .populate('friend_requests')
      .populate('createdEvents')
      .populate('invitedEvents')
      .populate('attendingEvents')
      .then(user => {
        if (!user) return res.status(404).json('User not found');
        res.json(user);
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } else {
    res.status(401).end();
  }
});

router.route('/:id/attendingEvents').patch(auth, (req, res) => {
  if (req.session.user.id !== req.params.id) {
    return res.status(401).end();
  }
  const {value, op} = req.body;
  console.log(value, op);
  if (op !== 'add' && op !== 'remove') {
    return res.status(400).send('Invalid op.');
  }

  const getUserPromise = User.findOne({username: req.session.user.username})
    .populate('attendingEvents')
    .populate('invitedEvents')
    .exec();

  const getEventPromise = Event.findById(value).exec();

  Promise.all([getUserPromise, getEventPromise])
    .then(([user, event]) => {
      if (!checkEventPermissions(event, req.session.user)) {
        throw {msg: 'Unauthorized', status: 401};
      }
      const eventIdStr = event._id.toString();
      const userIdStr = user._id.toString();

      if (op === 'add') {
        if (
          user.attendingEvents.findIndex(
            e => e._id.toString() === eventIdStr,
          ) !== -1
        ) {
          throw {msg: 'Error: Already attending event', status: 400};
        }
        user.attendingEvents.push(event._id);
        event.attending.push(user._id);
        if (!event.public) {
          user.invitedEvents.splice(
            user.invitedEvents.findIndex(e => e._id.toString() === eventIdStr),
            1,
          );
          event.invited.splice(
            event.invited.findIndex(u => u._id.toString() === userIdStr),
            1,
          );
        }
      } else if (op === 'remove') {
        if (
          user.attendingEvents.findIndex(
            e => e._id.toString() === eventIdStr,
          ) === -1
        ) {
          throw {
            msg: 'Error: Already not attending that event.',
            status: 400,
          };
        }
        user.attendingEvents.splice(
          user.attendingEvents.findIndex(e => e._id.toString() === eventIdStr),
          1,
        );
        event.attending.splice(
          event.attending.findIndex(u => u._id.toString() === userIdStr),
          1,
        );
        if (!event.public) {
          user.invitedEvents.push(event._id);
          event.invited.push(user._id);
        }
      }
      return Promise.all([user.save(), event.save()]);
    })
    .then(([user]) => {
      return user
        .populate('invitedEvents')
        .populate('attendingEvents')
        .execPopulate();
    })
    .then(user => {
      res.json(stripCredentials(user.toObject()));
    })
    .catch(err => {
      console.error(err);
      err.msg
        ? res.status(err.status).send(err.msg)
        : res.status(500).send('Server error');
    });
});

router
  .route('/:id/googleCalendarAuth')
  .post(auth, withGoogleOAuth2, (req, res) => {
    if (req.params.id !== req.session.user.id) {
      return res.status(401).end();
    }
    const {authCode} = req.body;
    req.oAuth2Client
      .getToken(authCode)
      .then(({tokens}) => {
        return User.findOneAndUpdate(
          {username: req.session.user.username},
          {$set: {gcAuthToken: tokens.refresh_token}},
          {new: true},
        );
      })
      .then(() => {
        res.end();
      })
      .catch(err => res.status(500).end(err));
  });

// TODO: remove this test endpoint
router.route('/:id/gcevents').get(auth, withGoogleOAuth2, (req, res) => {
  const calendar = google.calendar({version: 'v3', auth: req.oAuth2Client});
  calendar.events
    .list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    })
    .then(calendarData => res.json({events: calendarData.data.items}))
    .catch(err => res.status(500).send(err));
});

router.route('/:id').get(auth, checkId, (req, res) => {
  if (req.params.id !== req.session.user.id) {
    return res.status(401).end();
  }
  User.findById(req.params.id)
    .then(user => {
      if (!user) return res.status(404).json('User not found');
      res.json(stripCredentials(user.toObject));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').patch(auth, (req, res) => {
  if (req.session.user.id !== req.params.id) return res.status(401).end();
  let {firstName, lastName, location, address} = req.body;
  firstName = validator.escape(firstName.trim());
  lastName = validator.escape(lastName.trim());
  address = validator.escape(address.trim());
  if (!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
    return res.status(400).end();
  }
  User.findById(req.params.id)
    .then(user => {
      user.name = `${firstName} ${lastName}`;
      user.location = location;
      user.address = address;
      return user.save();
    })
    .then(user => {
      res.json(stripCredentials(user.toObject()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

const userInterestsSet = new Set(Object.values(userInterests));
router.route('/:id/interests').put(auth, (req, res) => {
  if (req.session.user.id !== req.params.id) return res.status(401).end();
  const interests = req.body.value;
  if (interests) {
    // Validate interests
    for (let i = 0; i < interests.length; i++) {
      if (!userInterestsSet.has(interests[i])) {
        return res
          .status(400)
          .send(`Invalid interest "${interests[i]}" specified`);
      }
    }
  }
  User.findById(req.params.id)
    .then(user => {
      user.interests = interests;
      return user.save();
    })
    .then(user => {
      res.json(stripCredentials(user.toObject));
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

router.route('/:username').get(auth, (req, res) => {
  User.find({username: req.params.username}, {password: 0, salt: 0})
    .then(user => {
      if (!user) return res.status(404).json('User not found');
      res.json(user);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/currentUser/requests').get(auth, (req, res) => {
  User.findOne({username: req.session.user.username})
    .populate('friend_requests')
    .then(user => {
      if (!user) return res.status(404).json('User not found');
      res.json(user.friend_requests);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/currentUser/friends').get(auth, (req, res) => {
  User.findOne({username: req.session.user.username})
    .populate('friends')
    .then(user => {
      if (!user) return res.status(404).json('User not found');
      res.json(user.friends);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id/friends').patch(auth, (req, res) => {
  if (req.params.id !== req.session.user.id) {
    return res.status(401).end();
  }
  const {op, value} = req.body;
  if (req.params.id === value) {
    return res.status(400).send('Cannot add/remove self from friends.');
  }
  if (op === 'add') {
    Promise.all([
      User.findById(req.params.id).exec(),
      User.findById(value).exec(),
    ])
      .then(([currentUser, friend]) => {
        if (!friend) {
          throw {msg: 'Could not find specified user.', status: 400};
        }
        if (
          !userExistsInCollection(
            friend._id.toString(),
            currentUser.friend_requests,
          )
        ) {
          throw {
            msg: 'No friend request found for specified user.',
            status: 400,
          };
        }
        currentUser.friend_requests.splice(
          currentUser.friend_requests.findIndex(
            friend => friend._id.toString() === currentUser._id.toString(),
          ),
          1,
        );
        currentUser.friends.push(friend._id);
        friend.friends.push(currentUser._id);
        return Promise.all([currentUser.save(), friend.save()]);
      })
      .then(([user]) => {
        return user
          .populate('friends')
          .populate('friend-requests')
          .execPopulate();
      })
      .then(({friends, friend_requests}) => {
        res.json({
          friends,
          friend_requests,
        });
      });
  } else if (op === 'remove') {
    Promise.all([
      User.findById(req.params.id).exec(),
      User.findById(value).exec(),
    ])
      .then(([currentUser, friend]) => {
        if (!friend) {
          throw {msg: 'Could not find specified user.', status: 400};
        }
        if (
          !userExistsInCollection(friend._id.toString(), currentUser.friends)
        ) {
          throw {
            msg: "Friend does not exist in user's friend list.",
            status: 400,
          };
        }

        currentUser.friends.splice(
          currentUser.friends.findIndex(
            friend => friend._id.toString() === friend._id.toString(),
          ),
          1,
        );

        friend.friends.splice(
          friend.friends.findIndex(
            friend => friend._id.toString() === currentUser._id.toString(),
          ),
          1,
        );

        const updateUser = currentUser.save();
        const updateFriend = friend.save();
        return Promise.all([updateUser, updateFriend]);
      })
      .then(([user]) => {
        return user.populate('friends').execPopulate();
      })
      .then(({friends}) => {
        res.json({friends});
      })
      .catch(err => {
        console.log(err);
        if (err.msg) return res.status(err.status).send(err.msg);
        res.status(400).send('Could not perform the requested delete.');
      });
  } else {
    res.status(400).send('Invalid op in rjsonequest.');
  }
});

router.route('/:id/friend_requests/').patch(auth, (req, res) => {
  const {op, value} = req.body;
  if (req.params.id === value) {
    return res.status(400).send('Cannot add/remove self from friends requests.');
  }
  if (op === 'add' && value !== req.session.user.id) {
    return res.status(401).end();
  } else if (op === 'remove' && req.params.id !== req.session.user.id) {
    return res.status(401).end();
  }
  if (op === 'add') {
    User.findById(req.params.id)
      .then(user => {
        if (userExistsInCollection(value, user.friend_requests)) {
          throw {msg: 'Cannot send duplicate friend requests.', status: 409};
        }
        user.friend_requests.push(mongoose.Types.ObjectId(value));
        return user.save();
      })
      .then(() => res.json('Request sent!'))
      .catch(err => {
        console.log(err);
        if (err.msg) {
          return res.status(err.status).send(err.msg);
        }
        res.status(400).json('Error: ' + err);
      });
  } else if (op === 'remove') {
    User.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {friend_requests: value},
      },
      {new: true},
    )
      .populate('friend_requests')
      .then(({friend_requests}) => {
        res.json({friend_requests});
      });
  } else {
    res.status(400).send('Invalid op in request.');
  }
});

module.exports = router;
