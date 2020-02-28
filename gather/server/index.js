const crypto = require('crypto');
const path = require('path');
const express = require('express');
const app = express();
const helmet = require('helmet');

app.use(helmet());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const validator = require('validator');

const https = require('https');
const PORT = 3000;

https.createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on http://localhost:%s", PORT);
});