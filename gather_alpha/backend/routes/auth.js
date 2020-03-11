const router = require('express').Router();
const validator = require('validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
require('dotenv').config();

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

router.route('/').post(checkEmail, (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    User.findOne({ email }).then(user => {
        if (!user) return res.status(404).json("No user with this email");

        if (user.password !== generateHash(password, user.salt)) {
            return res.status(400).json("Invalid credentials");
        }

        jwt.sign(
            { id: user._id },
            process.env.jwtSecret,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                return res.json({
                    token,
                    returnUser: {
                        username: user.username,
                        email: user.email
                    }
                }
                )
            });
    });
});

router.route('/').get(auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then(user => res.json(user));
});

module.exports = router;