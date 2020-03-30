const router = require('express').Router();
let Event = require('../models/event.model');
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  Event.find()
    .then(events => res.json(events))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/').post((req, res) => {
  const public = req.body.publicStatus;
  const title = req.body.title;
  const username = req.body.username;
  const description = req.body.description;
  const date = Date.parse(req.body.date);
  const invited = req.body.invited;
  const attending = req.body.attending;
  const location = req.body.location;
  const roomId = req.body.title;
  const tags = req.body.tags;

  const newEvent = new Event({
    public,
    title,
    username,
    description,
    date,
    location,
    roomId,
    invited,
    attending,
    tags,
  });

  newEvent
    .save()
    .then(() => {
      //console.log("invited users:" + newEvent.invited);
      return User.findOneAndUpdate(
        {username: newEvent.username},
        {$push: {createdEvents: newEvent.id}},
      ).exec();
    })
    .then(() => {
      res.json(newEvent.id);
      newEvent.invited.forEach(userId =>
        User.findByIdAndUpdate(userId, {
          $push: {invitedEvents: newEvent.id},
        }).exec(),
      );
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('Error: ' + err);
    });
});

router.route('/public').get((req, res) => {
  Event.find({public: true})
    .then(events => {
      res.json(events);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Event.findById(req.params.id)
    .populate('invited')
    .populate('attending')
    .then(event => {
      res.json(event);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Event.findByIdAndDelete(req.params.id)
    .then(event => {
      // Clean creator's createdEvents
      const cleanupPromises = [
        User.findOneAndUpdate(
          {
            username: event.username,
          },
          {
            $pull: {createdEvents: event._id},
          },
        ).exec(),
      ];
      // Clean invited users invitedEvents
      if (!event.public) {
        event.invited.forEach(uid =>
          cleanupPromises.push(
            User.findByIdAndUpdate(uid, {
              $pull: {invitedEvents: event._id},
            }).exec(),
          ),
        );
      }
      // Clean attending users attendingEvents
      event.attending.forEach(uid =>
        cleanupPromises.push(
          User.findByIdAndUpdate(uid, {
            $pull: {attendingEvents: event._id},
          }).exec(),
        ),
      );
      return Promise.all(cleanupPromises);
    })
    .then(() => res.json(req.params.id))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').put((req, res) => {
  Event.findById(req.params.id)
    .then(event => {
      Object.entries(req.body).forEach(([prop, updatedValue]) => {
        event[prop] = updatedValue;
      });
      event
        .save()
        .then(() => res.json('Event updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
