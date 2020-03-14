const router = require('express').Router();
let Event = require('../models/event.model');

router.route('/').get((req, res) => {
  Event.find()
    .then(events => res.json(events))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const public = req.body.public;
  const title = req.body.title;
  const username = req.body.username;
  const description = req.body.description;
  const date = Date.parse(req.body.date);
  const invited = req.body.invited;
  const attending = req.body.attending;
  const location = req.body.location;
  const tags = req.body.tags;

  const newEvent = new Event({
    public,
    title,
    username,
    description,
    date,
    location,
    invited,
    attending,
    tags
  });

  newEvent.save()
    .then(() => res.json('Event added!'))
    .catch(err => {
      console.log(err);
      res.status(400).json('Error: ' + err)
    });
});

router.route('/:id').get((req, res) => {
  Event.findById(req.params.id)
    .then(event => res.json(req.session))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Event.findByIdAndDelete(req.params.id)
    .then(() => res.json(req.params.id))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  Event.findById(req.params.id)
    .then(event => {
      event.public = req.body.public;
      event.title = req.body.title;
      event.username = req.body.username;
      event.description = req.body.description;
      event.date = Date.parse(req.body.date);
      event.location = req.body.location;
      event.invited = req.body.invited;
      event.attending = req.body.attending;
      event.tags = req.body.tags;

      event.save()
        .then(() => res.json('Event updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;