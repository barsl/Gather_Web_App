const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const {establishWSConnectionEndpoints} = require('./ws/SocketIO');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(helmet());

const port = process.env.PORT || 5000;
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? ['https://gatherup.social']
      : ['http://localhost:3000'],
  credentials: true,
};
app.use(express.urlencoded({extended: true}));
app.use(cors(corsOptions));
app.use(express.json());
const MongoStore = require('connect-mongo')(session);

if (process.env.NODE_ENV === 'production') app.enable('trust proxy');

const sessionConfig = session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  saveUninitialized: false,
  resave: false,
  proxy: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: parseInt(process.env.SESS_LIFETIME) / 1000,
  }),
  cookie: {
    path: '/',
    sameSite: process.env.NODE_ENV === 'production',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESS_LIFETIME),
  },
});

io.use((socket, next) => {
  sessionConfig(socket.request, {}, next);
});
app.use(sessionConfig);
establishWSConnectionEndpoints(io);
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

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
