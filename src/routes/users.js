const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const sql = require('../controllers/db');

router.post('/', async (req, res) => {
    try{
        const username = req.body?.username;
        const password = req.body?.password;
        const email = req.body?.email;
        
        if(!username || !password || !email){
            res.status(400).json({ 'message': 'Username, password and email are required.' });
        }

        if((username.length > 24 || password.length > 32 || email.length > 254) || (username.length < 3 || password.length < 8)){
            res.status(400).json({ 'message': 'Username, password or email has invalid length.' });
        }

        const user = await sql`
                SELECT username
                FROM users
                WHERE username = ${username}OR email = ${email}
            `;

        if(user){
            res.status(409).json({ 'message': 'User with this username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await sql`
            INSERT INTO users(
                username, hashed_password, email
            )
            VALUES(
                ${username}, ${hashedPassword}, ${email}
            )
            RETURNING *
        `;
        console.log(newUser);

        res.status(201).send();
    } catch {
        res.status(500).send();
    }
});

module.exports = router;