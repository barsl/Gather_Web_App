const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  password: { type: String, required: true, trim: true, minlength: 8 },
  salt: { type: String, required: true },
  name: { type: String, required: true, unique: true, trim: true },
  interests: { type: [String], required: true },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  friend_requests: { type: [String] },
  invitedEvents: [{ type: Schema.Types.ObjectId, ref: 'Event', required: true }],
  attendingEvents: [{ type: Schema.Types.ObjectId, ref: 'Event', required: true }],
  createdEvents: [{type: Schema.Types.ObjectId, ref: 'Event', required: true}],
  history: [{ type: Schema.Types.ObjectId, ref: 'Event', required: true }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;