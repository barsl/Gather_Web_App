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
  email: { type: String, required: true, unique: true, trim: true },
  interests: { type: [String], required: true },
  friends: { type: [String], required: true },
  friend_requests: { type: [String] },
  invitedEvents: { type: [String], required: true },
  attendingEvents: { type: [String], required: true },
  history: { type: [String], required: true },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;