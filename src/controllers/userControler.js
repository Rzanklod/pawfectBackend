const sql = require('./db');

// Funkcja do pobierania szczegółów użytkownika
const getUserDetails = async (req, res) => {
    try {
        console.log("1");
        const userId = req.params?.id;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        // Wykonanie zapytania przy użyciu 'sql' (zamiast 'sql.query')
        const user = await sql`
            SELECT id, username, email, avatar_filename
            FROM users
            WHERE id = ${userId}
        `;

        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        return res.json(user[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd serwera' });
    }
};

// Funkcja do aktualizacji szczegółów użytkownika
const updateUserDetails = async (req, res) => {
    try {
        const userId = req.params?.id;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        const { username, email, avatarFilename } = req.body;

        if (!username && !email && !avatarFilename) {
            return res.status(400).json({ message: 'At least one field is required to update' });
        }

        // Dynamiczne zapytanie, używając 'sql'
        let query = 'UPDATE users SET ';
        let params = [];
        let setFields = [];

        if (username) {
            setFields.push(`username = ${sql(username)}`);
        }
        if (email) {
            setFields.push(`email = ${sql(email)}`);
        }
        if (avatarFilename) {
            setFields.push(`avatar_filename = ${sql(avatarFilename)}`);
        }

        // Łączymy zapytanie
        query += setFields.join(', ') + ` WHERE id = ${sql(userId)} RETURNING id, username, email, avatar_filename`;

        // Wykonujemy zapytanie
        const user = await sql`${sql.raw(query)}`;

        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        return res.status(200).json({ message: 'User updated successfully', user: user[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd serwera' });
    }
};

// Funkcja do usuwania użytkownika
const deleteUser = async (req, res) => {
    try {
        const userId = req.params?.id;
        if (!userId) return res.status(400).json({ message: 'User ID is required' });

        // Usuwanie użytkownika
        const user = await sql`
            DELETE FROM users
            WHERE id = ${userId}
            RETURNING id
        `;

        if (user.length === 0) return res.status(404).json({ message: 'User not found' });

        return res.status(204).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Błąd serwera' });
    }
};


module.exports = {
    getUserDetails,
    updateUserDetails,
    deleteUser,
};
