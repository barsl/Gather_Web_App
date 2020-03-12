require('dotenv').config();

function auth(req, res, next) {
    if (!req.session.username) return res.status(401).json("Access Denied. Please login to continue");
    next();
}

module.exports = auth;