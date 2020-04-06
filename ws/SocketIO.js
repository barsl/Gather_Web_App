const Event = require('../models/event.model');
const {checkEventPermissions} = require('../util/functions/UserUtil');

const establishWSConnectionEndpoints = io => {
  io.on('connection', socket => {
    const {user} = socket.request.session;
    if (user) {
      socket.on('JOIN_EVENT', event => {
        Event.findById(event).then(eventDoc => {
          if (!checkEventPermissions(eventDoc, user)) {
            return;
          }
          socket.join(event);
          console.debug('Connected: ', user.username);

          socket.on('CHANGE_TITLE', title => {
            io.to(event).emit('RECEIVE_TITLE', title);
          });

          socket.on('CHANGE_DESCRIPTION', description => {
            io.to(event).emit('RECEIVE_DESCRIPTION', description);
          });

          socket.on('CHANGE_ADDRESS', address => {
            io.to(event).emit('RECEIVE_ADDRESS', address);
          });

          socket.on('CHANGE_START_DATE', startDate => {
            io.to(event).emit('RECEIVE_START_DATE', startDate);
          });

          socket.on('CHANGE_END_DATE', endDate => {
            io.to(event).emit('RECEIVE_END_DATE', endDate);
          });

          socket.on('CHANGE_TAGS', tags => {
            io.to(event).emit('RECEIVE_TAGS', tags);
          });

          socket.on('SAVE_EVENT', updatedEvent => {
            io.to(event).emit('RECEIVE_EVENT_UPDATE', updatedEvent);
          });
        });
      });
    }
  });
};

module.exports = {establishWSConnectionEndpoints};
