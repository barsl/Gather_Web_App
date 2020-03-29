const router = require("express").Router();
const validator = require("validator");
const crypto = require("crypto");
const cookie = require("cookie");
const auth = require("../middleware/auth");
const { google } = require("googleapis");
const withGoogleOAuth2 = require("../middleware/withGoogleOAuth2");
require("dotenv").config();

let User = require("../models/user.model");
let Event = require("../models/event.model");

function checkId(req, res, next) {
  if (!validator.isAlphanumeric(req.params.id))
    return res.status(400).json("Invalid user id");
  req.params.id = validator.trim(req.params.id);
  req.params.id = validator.escape(req.params.id);
  next();
}

router.route("/").get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/currentUser").get(auth, (req, res) => {
  //get user from session
  if (req.session.user) {
    User.findOne({ username: req.session.user.username })
      .populate("friends")
      .populate("createdEvents")
      .populate("invitedEvents")
      .populate("attendingEvents")
      .then(user => {
        if (!user) return res.status(404).json("User not found");
        res.json(user);
      })
      .catch(err => res.status(400).json("Error: " + err));
  } else {
    res.status(400).send(":(");
  }
});

// TODO: https://tools.ietf.org/html/rfc6902#appendix-A.2
router.route("/:id").patch(auth, (req, res) => {
  if (!req.session.user || req.session.user.id !== req.params.id) {
    return res.status(403).end();
  }
  const { attendingEvent, action } = req.body;
  console.log(attendingEvent, action);
  User.findOne({ username: req.session.user.username })
    .populate("attendingEvents")
    .populate("invitedEvents")
    .then(user => {
      if (
        action === "add" &&
        user.attendingEvents.findIndex(event => event._id == attendingEvent) !==
          -1
      ) {
        throw { msg: "Error: Already attending event", status: 400 };
      } else if (
        action === "remove" &&
        user.attendingEvents.findIndex(event => {
          return event._id == attendingEvent;
        }) === -1
      ) {
        throw {
          msg: "Error: Already not attending that event.",
          status: 400
        };
      }

      let userUpdateQuery =
        action === "add"
          ? {
              $push: { attendingEvents: attendingEvent }
            }
          : { $pull: { attendingEvents: attendingEvent } };
      User.findOneAndUpdate(
        { username: req.session.user.username },
        userUpdateQuery,
        { new: true }
      )
        .populate("attendingEvents")
        .populate("invitedEvents")
        .then(user => {
          Event.findById(attendingEvent, (err, event) => {
            if (err) return res.status(500).send("Error retrieving event");
            let eventUpdateQuery;
            if (action === "add") {
              eventUpdateQuery = { $push: { attending: user._id } };
              if (!event.public) {
                eventUpdateQuery.$pull = { invited: user._id };
              }
            } else {
              eventUpdateQuery = { $pull: { attending: user._id } };
              if (!event.public) {
                eventUpdateQuery.$push = { invited: user._id };
              }
            }
            event.updateOne(eventUpdateQuery).exec();
            if (event.public) {
              return res.json(user);
            }
            const userUpdateQuery =
              action === "add"
                ? { $pull: { invitedEvents: attendingEvent } }
                : { $push: { invitedEvents: attendingEvent } };
            User.findByIdAndUpdate(user._id, userUpdateQuery, { new: true })
              .populate("invitedEvents")
              .populate("attendingEvents")
              .then(updatedUser => {
                res.json(updatedUser);
              });
          });
        });
    })
    .catch(err => {
      if (err.msg) {
        res.status(err.status).send(err.msg);
      } else {
        res.status(500).send("Server error");
      }
    });
});

router
  .route("/:id/googleCalendarAuth")
  .post(auth, withGoogleOAuth2, (req, res) => {
    if (req.params.id !== req.session.user.id) {
      return res.status(401).end();
    }
    const { authCode } = req.body;
    req.oAuth2Client
      .getToken(authCode)
      .then(({ tokens }) => {
        return User.findOneAndUpdate(
          { username: req.session.user.username },
          { $set: { gcAuthToken: tokens.refresh_token } },
          { new: true }
        );
      })
      .then(() => {
        res.end();
      })
      .catch(err => res.status(500).end(err));
  });

router.route("/:id/gcevents").get(auth, withGoogleOAuth2, (req, res) => {
  const calendar = google.calendar({ version: "v3", auth: req.oAuth2Client });
  calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime"
    })
    .then(calendarData => res.json({ events: calendarData.data.items }))
    .catch(err => res.status(500).send(err));
});

router.route("/:id").get(auth, checkId, (req, res) => {
  User.findById(req.params.id)
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/:username").get(auth, (req, res) => {
  User.find({ username: req.params.username })
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/name/:name").get((req, res) => {
  User.findOne({ username: req.params.name })
    .then(user => res.json(user))
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/currentUser/requests").get(auth, (req, res) => {
  User.findOne({ username: req.session.user.username })
    .populate("friend_requests")
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user.friend_requests);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/currentUser/friends").get(auth, (req, res) => {
  User.findOne({ username: req.session.user.username })
    .populate("friends")
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user.friends);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

module.exports = router;
