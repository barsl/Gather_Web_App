require('dotenv').config();
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    // if there is no token then access is forbidden
    if (!token) res.status(401).json("Invalid access, no token");

    try {
        // verify the token 
        const decodeToken = jwt.verify(token, "gatherC09ProjectJwtSecret");

        req.user = decodeToken;
        next();
    } catch (e) {
        res.status(400).json("Token is not valid");
    }
}

module.exports = auth;