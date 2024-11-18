const sql = require('./db');

const verifyUserCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: 'Email and verification code are required.' });
        }

        const users = await sql`
            SELECT id, verification_code, is_verified FROM users WHERE email = ${email}
        `;

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'User already verified.' });
        }

        if (user.verification_code === code) {
            await sql`
                UPDATE users
                SET is_verified = true, verification_code = null
                WHERE id = ${user.id}
            `;
            return res.status(200).json({ message: 'Email verified successfully.' });
        } else {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ message: 'Server error during verification.' });
    }
};

module.exports = { verifyUserCode };
