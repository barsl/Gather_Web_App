const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const eventSchema = new Schema(
  {
    public: {type: Boolean, required: true},
    title: {type: String, required: true},
    username: {type: String, required: true},
    description: {type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    location: [{type: Number, required: true}],
    roomId: { type: String , required: true},
    invited: [{type: Schema.Types.ObjectId, ref: 'User', required: true}],
    attending: [{type: Schema.Types.ObjectId, ref: 'User'}],
    tags: {type: [String]},
    // TODO: add media
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
