const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

const sendVerificationEmail = async (email, username, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Potwierdzenie rejestracji',
        text: `Cześć ${username},\n\nDziękujemy za rejestrację! Twój kod weryfikacyjny to: ${verificationCode}\n\n`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Wysłano e-mail weryfikacyjny.');
    } catch (error) {
        console.error('Błąd podczas wysyłania e-maila:', error);
        throw new Error('Nie udało się wysłać e-maila weryfikacyjnego.');
    }
};

const sendPasswordResetEmail = async (email, username, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: email,
        subject: 'Resetowanie hasła',
        text: `Cześć ${username},\n\nAby zresetować swoje hasło, wpisz poniższy kod w aplikacji:\n\nKod weryfikacyjny: ${verificationCode}\n\nJeśli to nie Ty inicjowałeś reset hasła, zignoruj tę wiadomość.\n\nPozdrawiamy`
    };

    try {
        // Wyślij e-mail
        await transporter.sendMail(mailOptions);
        console.log('Wysłano e-mail z kodem resetującym hasło.');
    } catch (error) {
        console.error('Błąd podczas wysyłania e-maila resetującego hasło:', error.message);
        throw new Error('Nie udało się wysłać e-maila resetującego. Sprawdź konfigurację serwera poczty.');
    }
};



module.exports = { sendVerificationEmail, sendPasswordResetEmail};
