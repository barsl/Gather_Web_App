const router = require('express').Router();
const Event = require('../models/event.model');
const User = require('../models/user.model');
const auth = require('../middleware/auth');
const {publicEventRecommender} = require('../util/functions/Recommender');
const {checkEventPermissions} = require('../util/functions/UserUtil');

router.route('/').post(auth, (req, res) => {
  const public = req.body.publicStatus;
  const title = req.body.title;
  const username = req.body.username;
  const description = req.body.description;
  const startDate = Date.parse(req.body.startDate);
  const endDate = Date.parse(req.body.endDate);
  const invited = req.body.invited;
  const attending = req.body.attending;
  const location = req.body.location;
  const roomId = req.body.roomId;
  const tags = req.body.tags;

  const newEvent = new Event({
    public,
    title,
    username,
    description,
    startDate,
    endDate,
    location,
    roomId,
    invited,
    attending,
    tags,
  });

  newEvent
    .save()
    .then(() => {
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

const getEventsWithRecommendationScore = (events, user) => {
  return Promise.all(
    events.map(event => {
      return new Promise((resolve, reject) => {
        publicEventRecommender(user, event)
          .then(score => {
            resolve({...event._doc, recommendScore: score});
          })
          .catch(reject);
      });
    }),
  );
};

router.route('/public').get(auth, (req, res) => {
  Event.find({public: true})
    .then(events => {
      const user = req.query.recommend
        ? User.findById(req.session.user.id)
        : null;
      return Promise.all([events, user]);
    })
    .then(([events, user]) => {
      if (!user) {
        return events;
      }
      return getEventsWithRecommendationScore(events, user);
    })
    .then(events => res.json(events))
    .catch(err => {
      console.log(err);
      res.status(400).json('Error: ' + err);
    });
});

router.route('/:id').get(auth, (req, res) => {
  Event.findById(req.params.id)
    .populate('invited')
    .populate('attending')
    .then(event => {
      if (!checkEventPermissions) return res.status(401).end();
      res.json(event);
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(auth, (req, res) => {
  Event.findById(req.params.id)
    .then(event => {
      if (event.username !== req.session.user.username) {
        throw {msg: 'Unauthorized', status: 401};
      }
      return Promise.all([event, Event.deleteOne({_id: event._id}).exec()]);
    })
    .then(([event]) => {
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
    .catch(err => {
      if (err.msg) {
        return res.status(err.status).end();
      }
      res.status(400).json('Error: ' + err);
    });
});

router.route('/:id').put(auth, (req, res) => {
  Event.findById(req.params.id)
    .populate('invited')
    .populate('attending')
    .then(event => {
      if (!checkEventPermissions(event, req.session.user)) {
        return res.status(401).end();
      }
      Object.entries(req.body).forEach(([prop, updatedValue]) => {
        event[prop] = updatedValue;
      });
      event
        .save()
        .then(() => res.json(event))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

//IMAGE UPLOAD CONFIGURATION
const multer = require("multer");
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are accepted!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "barsl",
  api_key: "592362793371862",
  api_secret: "jr7QRJLHyUEDCuM6PqFVcY6ox1I"
});

router.route("/pics/add/:id").post(upload.single("image"), (req, res) => {
  cloudinary.v2.uploader.upload(req.file.path, options = {tags: [req.params.id]}, function(err, result) {
    if (err) {
      req.json(err.message);
    }

    req.body.image = result.secure_url;
    
    req.body.imageId = result.public_id;

    Event.findById(req.params.id)
    .then(event => {
      event.pics = event.pics.concat(result.secure_url); 
      event.save()
        .then(() => res.json("Request sent!"))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
  });
});


router.route('/pics/get/:id').get((req, res) => { 
  Event.findById(req.params.id)
    .then(event => {
      res.json(event.pics);
    })
    .catch(err => res.status(400).json("Error: " + err));
});

router.route('/pics/gif/:id').get((req, res) => {
  cloudinary.v2.uploader.multi(req.params.id, options = {delay: 1000, height: 500, width: 500}, function(err, result) {
    if (err) {
      req.json(err.message);
    }
    res.json(result);
  });
});


router.route('/pics/delete').post((req, res) => {
  console.log(req.body);
  Event.findByIdAndUpdate(req.body.event_id, 
    { $pull: { pics: req.body.pic } }).exec()
    .catch(err => res.status(400).json('cant delete: ' + err));
});



module.exports = router;
