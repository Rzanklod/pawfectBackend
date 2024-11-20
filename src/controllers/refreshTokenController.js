const jwt = require('jsonwebtoken');
const sql = require('./db');
const { REFRESH_TOKEN_SECRET, ACCESS_TOKEN_SECRET } = require('../../config');

const handleRefreshToken = async (req, res) => {
    try{
        const cookies = req.cookies;
        if(!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        
        const foundUser = await sql`
            SELECT id, username, refresh_token
            FROM users
            WHERE refresh_token = ${refreshToken}
        `;
        
        if(!foundUser) return res.sendStatus(403);
        
        jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if(err || foundUser[0].username !== decoded.username) return res.sendStatus(401);
                const accessToken = jwt.sign(
                    { "username": decoded.username }, 
                    ACCESS_TOKEN_SECRET,
                    { expiresIn: '60s' }
                );
                res.json({ uid: foundUser[0].id, accessToken });
            }
        )
    } catch {
        return res.sendStatus(500);
    }
}

module.exports = { handleRefreshToken };