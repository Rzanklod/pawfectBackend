const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('./db');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require('../../config');

const handleLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            console.log('Username or password not provided');
            return res.status(400).json({ message: 'Username and password are required.' });
        }

        // Pobranie użytkownika z bazy
        const foundUser = await sql`
            SELECT username, hashed_password
            FROM users
            WHERE username = ${username}
        `;
        
        if (foundUser.length === 0) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Porównanie hasła
        const match = await bcrypt.compare(password, foundUser[0].hashed_password);
        if (!match) {
            console.log('Password does not match');
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generowanie tokenów
        console.log('Generating tokens');
        const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: '60s' });
        const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Aktualizacja tokenu odświeżania w bazie
        await sql`
            UPDATE users
            SET refresh_token = ${refreshToken}
            WHERE username = ${username}
        `;

        // Ustawienie ciasteczka z tokenem odświeżania
        res.cookie('jwt', refreshToken, { 
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true 
        });

        return res.json({ accessToken });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { handleLogin };
