const jwt = require('jsonwebtoken');
const sql = require('./db');
const { REFRESH_TOKEN_SECRET, ACCES_TOKEN_SECRET } = require('../../config');

const handleRefreshToken = (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = sql`
        SELECT username, refresh_token
        FROM users
        WHERE refresh_token = ${refreshToken}
    `;

    if(!foundUser) return res.sendStatus(403);

    jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.username !== decoded.username) return res.sendStatus(401);
            const accessToken = jwt.sign(
                { "username": decoded.username }, 
                ACCES_TOKEN_SECRET,
                { expiresIn: '60s' }
            );
            res.json({ accessToken });
        }
    )
}

module.exports = { handleRefreshToken };