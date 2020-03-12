const router = require('express').Router();
const validator = require('validator');
const crypto = require('crypto');
require('dotenv').config();
const cookie = require('cookie');
let User = require('../models/user.model');

function generateSalt() {
    return crypto.randomBytes(16).toString('base64');
}

function generateHash(password, salt) {
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    return hash.digest('base64');
}

function checkUsername(req, res, next) {
    req.body.username = validator.trim(req.body.username);
    req.body.username = validator.escape(req.body.username);
    next();
}

router.route('/signin').post(checkUsername, (req, res) => {
    const password = req.body.password;
    const username = req.body.username;

    User.findOne({ username }).then(user => {
        if (!user) return res.status(404).json("No user with this email");

        if (user.password !== generateHash(password, user.salt)) {
            return res.status(400).json("Invalid credentials");
        }

        req.session.username = user;
        res.setHeader('Set-Cookie', cookie.serialize('username', user.username), {
            path: '/',
            maxAge: parseInt(process.env.SESS_LIFETIME)
        })
        return res.json(req.session.username.username);
    });
});

router.route('/signup').post(checkUsername, (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;

    User.findOne({ username }).then(user => {
        if (user) return res.status(409).json("User with this username already exists");

        let salt = generateSalt();
        let saltedPassword = generateHash(password, salt);

        const newUser = new User({
            username,
            password: saltedPassword,
            salt,
            name,
            interests: [],
            friends: [],
            friend_requests: [],
            invitedEvents: [],
            attendingEvents: [],
            history: [],
        });

        newUser.save()
            .then(savedUser => {
                req.session.username = savedUser;
                res.setHeader('Set-Cookie', cookie.serialize('username', savedUser.username), {
                    path: '/',
                    maxAge: parseInt(process.env.SESS_LIFETIME)
                })
                res.json(savedUser);
            }).catch(err => {
                return res.status(500).json(err);
            });
    });
});

router.route('/logout').get((req, res) => {
    req.session.destroy();
    res.clearCookie('username');
    res.json('Logged out');
});

router.route('/verify').get((req, res) => {
    if (!req.session.username) res.json({ isValid: false })
    else res.json({ isValid: true })
});

module.exports = router;