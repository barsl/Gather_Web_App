const router = require("express").Router();
const validator = require("validator");
const crypto = require("crypto");
const cookie = require("cookie");
const auth = require("../middleware/auth");
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
  if (req.session.username) {
    User.findOne({ username: req.session.username.username })
      .populate("friends")
      .then(user => {
        if (!user) return res.status(404).json("User not found");
        res.json(user);
      })
      .catch(err => res.status(400).json("Error: " + err));
  } else {
    res.status(400).send(":(");
  }
});

router.route("/currentUser").patch(auth, (req, res) => {
  if (req.session.username) {
    const { attendingEvent, action } = req.body;
    console.log(attendingEvent, action);
    User.findOne({ username: req.session.username.username })
      .populate("attendingEvents")
      .populate("invitedEvents")
      .then(user => {
        if (
          action === "add" &&
          user.attendingEvents.findIndex(
            event => event._id == attendingEvent
          ) !== -1
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
          { username: req.session.username.username },
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
  } else {
    res.status(400).send(":(");
  }
});

// get the events the current user is invited to
router.route("/currentUser/invitedTo").get(auth, (req, res) => {
  User.findOne({ username: req.session.username.username })
    .populate("invitedEvents")
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user.invitedEvents);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/currentUser/events").get(auth, (req, res) => {
  User.findOne({ username: req.session.username.username })
    .populate("invitedEvents")
    .populate("attendingEvents")
    .populate("createdEvents")
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      const { invitedEvents, attendingEvents, createdEvents } = user;
      res.json({ invitedEvents, attendingEvents, createdEvents });
    });
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
  User.findOne({ username: req.session.username.username })
    .populate("friend_requests")
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user.friend_requests);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

router.route("/currentUser/friends").get(auth, (req, res) => {
  User.findOne({ username: req.session.username.username })
    .populate("friends")
    .then(user => {
      if (!user) return res.status(404).json("User not found");
      res.json(user.friends);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

module.exports = router;
