const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(helmet());
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ['http://localhost:3000', 'https://gather-app-c09.herokuapp.com'],
  credentials: true
}
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
const MongoStore = require('connect-mongo')(session);

if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(express.static(__dirname + '/frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/frontend/build/index.html'));
  });
}

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
    sameSite: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.SESS_LIFETIME)
  }
}));

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

app.use('/events', eventsRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
