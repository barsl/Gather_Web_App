const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const MongoStore = connectStore(session);

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use(session({
  name: process.env.SESS_NAME,
  secret: process.env.SESS_SECRET,
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    collection: 'session',
    ttl: parseInt(process.env.SESS_LIFETIME) / 1000
  }),
  cookie: {
    sameSite: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(SESS_LIFETIME)
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
app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
