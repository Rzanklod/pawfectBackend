const jwt = require('jsonwebtoken');
const { ACCES_TOKEN_SECRET } = require('../../config');

const verifyJWT = (req, res, next) => {
    const authHeader = req?.headers['authorization'];
    if(!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        ACCES_TOKEN_SECRET,
        (err, decoded) => {
            if(err) return res.sendStatus(403);
            req.user = decoded.username;
            next();
        }
    );
}

module.exports = verifyJWT;