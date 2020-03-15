const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
<<<<<<< HEAD
  public: {type: Boolean, required: true},
  title: {type: String, required: true},
=======
  // public: {type: Boolean, required: true}, TODO: implement?
  public: { type: Boolean, required: false },
  title: { type: String, required: true },
>>>>>>> implemented adding markers functionality to the map
  username: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  // location: {type: String, required: true}, TODO: Uncomment when implemented
<<<<<<< HEAD
  location: {type: String, required: false},
  invited: [{type: Schema.Types.ObjectId, ref: 'User', required: true }],
  attending: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  tags: {type: [String], required: false}
=======
  location: { type: [[Number]], required: false },
  invited: { type: [String], required: true },
  attending: { type: [String], required: false },
  tags: { type: [String], required: false }
>>>>>>> implemented adding markers functionality to the map
  // TODO: add media
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;