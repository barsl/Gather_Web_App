const router = require('express').Router();
const validator = require('validator');
const crypto = require('crypto');
require('dotenv').config();
const cookie = require('cookie');
const auth = require('../middleware/auth');
let User = require('../models/user.model');

function generateHash(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

function checkEmail(req, res, next) {
    if (!validator.isEmail(req.body.email)) return res.status(400).json("Invalid email");
    req.body.email = validator.normalizeEmail(req.body.email);
    next();
}

router.route('/signin').post(checkEmail, (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    User.findOne({ email }).then(user => {
        if (!user) return res.status(404).json("No user with this email");

        if (user.password !== generateHash(password, user.salt)) {
            return res.status(400).json("Invalid credentials");
        }

        req.session.username = user;

        res.setHeader('Set-Cookie', cookie.serialize('username', user.username), {
            path: '/',
            maxAge: process.env.SESS_LIFETIME
        })
        return res.json(user.username);
    });
});

router.route('/').get(auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then(user => res.json(user));
});

module.exports = router;