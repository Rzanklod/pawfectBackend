const sql = require('./db');

const handleLogout = async (req, res) => {
    // po stronie klienta usunac accesToken !!!!
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const foundUser = sql`
        SELECT refresh_token
        FROM users
        WHERE refresh_token = ${refreshToken}
    `;

    if(!foundUser){
        res.clearCookie('jwt', { secure: true });
        return res.sendStatus(204);
    }

    await sql`
        UPDATE users
        SET refresh_token = NULL
        WHERE refresh_token = ${refreshToken}
    `;

    res.clearCookie('jwt', { secure: true });
    return res.sendStatus(204);
}

module.exports = { handleLogout };