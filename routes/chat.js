const router = require('express').Router();
const Chatkit = require('@pusher/chatkit-server');
require('dotenv').config();

const chatkit = new Chatkit.default({
    instanceLocator: process.env.CHATKIT_INSTANCELOCATOR,
    key: process.env.CHATKIT_KEY
})

router.route('/createUser').post((req, res) => {
    chatkit
        .createUser({
            name: req.body.username,
            id: req.body.username
        })
        .then(() => res.json('created new user for Chatkit'))
        .catch(err => {
            res.status(err.statusCode).json(err);
        });
})

router.route('/auth').post((req, res) => {
    const authData = chatkit.authenticate({
        userId: req.session.username.username
    });

    res.status(authData.status)
        .send(authData.body);
})

module.exports = router;