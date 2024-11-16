const bcrypt = require('bcrypt');
const sql = require('./db');
const { sendVerificationEmail } = require('./mailer'); 

const handleNewUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if(
            (username.length > 24 || password.length > 32 || email.length > 254) 
            || 
            (username.length < 3 || password.length < 8)){
            return res.status(400).json({ 'message': 'Username, password or email has invalid length.' });
        }
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        const existingUser = await sql`
            SELECT id FROM users 
            WHERE username = ${username} OR email = ${email}
        `;

        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'User with this username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`
            INSERT INTO users (username, hashed_password, email)
            VALUES (${username}, ${hashedPassword}, ${email})
        `;

        return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
};


// Funkcja do generowania 6-cyfrowego kodu weryfikacyjnego
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { handleNewUser };
