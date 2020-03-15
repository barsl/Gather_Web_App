const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  public: {type: Boolean, required: true},
  title: {type: String, required: true},
  username: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  // location: {type: String, required: true}, TODO: Uncomment when implemented
  location: {type: String, required: false},
  invited: [{type: Schema.Types.ObjectId, ref: 'User', required: true }],
  attending: [{type: Schema.Types.ObjectId, ref: 'User', required: false}],
  tags: {type: [String], required: false}
  // TODO: add media
}, {
  timestamps: true,
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;