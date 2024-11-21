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
        text: `Cześć ${username},\n\nAby zresetować swoje hasło, wpisz ten kod w aplikacji${verificationCode}\n\n`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Wysłano e-mail z linkiem resetującym hasło.');
    } catch (error) {
        console.error('Błąd podczas wysyłania e-maila:', error);
        throw new Error('Nie udało się wysłać e-maila resetującego.');
    }
};


module.exports = { sendVerificationEmail, sendPasswordResetEmail};
