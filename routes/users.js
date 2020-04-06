const router = require('express').Router();
const validator = require('validator');
const auth = require('../middleware/auth');
const {google} = require('googleapis');
const userInterests = require('../util/constants/userInterests.js');
const withGoogleOAuth2 = require('../middleware/withGoogleOAuth2');
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

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/currentUser').get(auth, (req, res) => {
  //get user from session
  if (req.session.user) {
    User.findOne({username: req.session.user.username})
      .populate('friends')
      .populate('createdEvents')
      .populate('invitedEvents')
      .populate('attendingEvents')
      .then(user => {
        if (!user) return res.status(404).json('User not found');
        res.json(user);
      })
      .catch(err => res.status(400).json('Error: ' + err));
  } else {
    res.status(403).end();
  }
});

router.route('/:id/attendingEvents').patch(auth, (req, res) => {
  if (!req.session.user || req.session.user.id !== req.params.id) {
    return res.status(403).end();
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
      res.json(user);
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
  User.findById(req.params.id)
    .then(user => {
      if (!user) return res.status(404).json('User not found');
      res.json(user);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').patch(auth, (req, res) => {
  if (req.session.user.id !== req.params.id) return res.status(403).end();
  let {firstName, lastName} = req.body;
  firstName = validator.escape(firstName.trim());
  lastName = validator.escape(lastName.trim());
  if (!validator.isAlpha(firstName) || !validator.isAlpha(lastName)) {
    return res.status(400).end();
  }
  User.findById(req.params.id)
    .then(user => {
      user.name = `${firstName} ${lastName}`;
      return user.save();
    })
    .then(user => {
      res.json({name: user.name});
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

const userInterestsSet = new Set(Object.values(userInterests));
router.route('/:id/interests').put(auth, (req, res) => {
  if (req.session.user.id !== req.params.id) return res.status(403).end();
  const interests = req.body.value;
  if (interests) {
    // Validate interests
    for (let i = 0; i < interests.length; i++) {
      if (!userInterestsSet.has(interests[i])) {
        return res.status(400).send(`Invalid interest "${interests[i]}" specified`);
      }
    }
  }
  User.findById(req.params.id)
    .then(user => {
      user.interests = interests;
      return user.save();
    })
    .then(user => {
      res.json({interests: user.interests});
    })
    .catch(err => {
      console.error(err);
      res.status(500).end();
    })
});

router.route('/:username').get(auth, (req, res) => {
  User.find({username: req.params.username})
    .then(user => {
      if (!user) return res.status(404).json('User not found');
      res.json(user);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/name/:name').get((req, res) => {
  User.findOne({username: req.params.name})
    .then(user => res.json(user))
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

module.exports = router;
