const sql = require('./db'); 
const { sendPasswordResetEmail } = require('./mailer'); 
const bcrypt = require("bcrypt");

// Funkcja do generowania kodu weryfikacyjnego
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000);

// Funkcja obsługująca żądanie resetowania hasła
const handlePasswordResetRequest = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Adres e-mail jest wymagany.' });
    }

    try {
        // Sprawdzamy, czy użytkownik o podanym e-mailu istnieje w bazie danych
        const result = await sql`
            SELECT * FROM users WHERE email = ${email}
        `;
        const user = result[0]; // Zwróci tablicę, bierzemy pierwszy element (jeśli istnieje)

        if (!user) {
            return res.status(404).json({ message: 'Użytkownik z podanym e-mailem nie istnieje.' });
        }

        const verificationCode = generateVerificationCode();

        // Zapisujemy kod weryfikacyjny do bazy danych
        await sql`
            UPDATE users SET verification_code = ${verificationCode} WHERE email = ${email}
        `;

        // Wysyłamy e-mail z kodem weryfikacyjnym
        await sendPasswordResetEmail(email, user.username, verificationCode);

        res.status(200).json({ message: 'E-mail z kodem został wysłany.' });
    } catch (error) {
        console.error('Błąd podczas resetowania hasła:', error);
        res.status(500).json({ message: 'Wystąpił problem podczas wysyłania e-maila.' });
    }
};

// Funkcja obsługująca resetowanie hasła
const resetPassword = async (req, res) => {
    const { verificationCode, newPassword } = req.body;

    if (!verificationCode || !newPassword) {
        return res.status(400).json({ message: 'Kod weryfikacyjny i nowe hasło są wymagane.' });
    }

    try {
        // Szukamy użytkownika po kodzie weryfikacyjnym
        const result = await sql`
            SELECT * FROM users WHERE verification_code = ${verificationCode}
        `;
        const user = result[0];

        if (!user) {
            return res.status(400).json({ message: 'Nieprawidłowy kod weryfikacyjny.' });
        }

        // Tworzymy sól i haszujemy nowe hasło
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Aktualizujemy hasło i kasujemy kod weryfikacyjny
        await sql`
            UPDATE users 
            SET hashed_password = ${hashedPassword}, verification_code = NULL
            WHERE id = ${user.id}
        `;

        res.status(200).json({ message: 'Hasło zostało zaktualizowane.' });
    } catch (error) {
        console.error('Błąd podczas resetowania hasła:', error);
        res.status(500).json({ message: 'Wystąpił problem podczas resetowania hasła.' });
    }
};

//zmiana hasła jako zalogowany user
const resetPassLoged = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Identyfikator użytkownika, obecne hasło i nowe hasło są wymagane.' });
    }

    try {
        // Pobieramy użytkownika z bazy danych po userId
        const result = await sql`
            SELECT * FROM users WHERE id = ${userId}
        `;
        const user = result[0];

        if (!user) {
            return res.status(404).json({ message: 'Użytkownik nie został znaleziony.' });
        }

        
        // Sprawdzamy, czy obecne hasło jest poprawne
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.hashed_password);
        
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Obecne hasło jest nieprawidłowe.' });
        }

        // Tworzymy sól i haszujemy nowe hasło
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Aktualizujemy hasło w bazie danych
        await sql`
            UPDATE users 
            SET hashed_password = ${hashedNewPassword}
            WHERE id = ${user.id}
        `;

        res.status(200).json({ message: 'Hasło zostało pomyślnie zaktualizowane.' });
    } catch (error) {
        console.error('Błąd podczas zmiany hasła:', error);
        res.status(500).json({ message: 'Wystąpił problem podczas zmiany hasła.' });
    }
};


module.exports = { handlePasswordResetRequest, resetPassword, resetPassLoged };
