const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.use(helmet());

const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true
}
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
const MongoStore = require('connect-mongo')(session);

if (process.env.NODE_ENV === 'production') app.enable('trust proxy');

app.use(session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  saveUninitialized: false,
  resave: false,
  proxy: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: parseInt(process.env.SESS_LIFETIME) / 1000
  }),
  cookie: {
    path: '/',
    sameSite: process.env.NODE_ENV === 'production',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESS_LIFETIME)
  }
}));

io.on('connection', socket => {

  socket.on('JOIN_EVENT', event => {
    socket.join(event);

    socket.on('CHANGE_TITLE', title => {
      io.to(event).emit('RECEIVE_TITLE', title);
    });

    socket.on('CHANGE_DESCRIPTION', description => {
      io.to(event).emit('RECEIVE_DESCRIPTION', description);
    });

    socket.on('CHANGE_ADDRESS', address => {
      io.to(event).emit('RECEIVE_ADDRESS', address);
    });

    socket.on('CHANGE_DATE', date => {
      io.to(event).emit('RECEIVE_DATE', date);
    });
  });
})

const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const eventsRouter = require('./routes/events');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const friendsRouter = require('./routes/friends');
const constsRouter = require('./routes/consts');

app.use('/events', eventsRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/chat', chatRouter);
app.use('/friends', friendsRouter);
app.use('/consts', constsRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/frontend/build/index.html'));
  });
}

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
