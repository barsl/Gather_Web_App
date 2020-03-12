const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true
}
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(express.json());
const MongoStore = require('connect-mongo')(session);

app.use(session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'session',
    ttl: parseInt(process.env.SESS_LIFETIME)
  }),
  cookie: {
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
