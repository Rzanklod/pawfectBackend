const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('./db');
const { ACCES_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../../config');

const handleLogin = async (req, res) => {
    try{
        const { username, password } = req.body;
        if(!username || !password){
            return res.sendStatus(400).json({ 'message': 'Username and password are required.' });
        }
    
        const foundUser = await sql`
            SELECT username, hashed_password
            FROM users
            WHERE username = ${username}
        `;
        
        if(!foundUser) return res.sendStatus(401);
    
        const match = bcrypt.compare(password, foundUser[0].hashed_password);
        if(!match) return res.sendStatus(401);
    
        const accesToken = jwt.sign({ username }, ACCES_TOKEN_SECRET, { expiresIn: '60s' });
        const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        await sql`
            UPDATE users
            SET refresh_token = ${refreshToken}
            WHERE username = ${username}
        `;

        res.cookie('jwt', refreshToken, { 
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true 
        });

        return res.json({ accesToken });
    } catch {
        return res.sendStatus(500);
    }
}

module.exports = { handleLogin };