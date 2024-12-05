const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sql = require("./db");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../../config");

const handleLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      console.log("Username or password not provided");
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const foundUser = await sql`
            SELECT id, username, hashed_password, avatar_filename
            FROM users
            WHERE username = ${username}
        `;

    if (foundUser.length === 0) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const match = await bcrypt.compare(password, foundUser[0].hashed_password);
    if (!match) {
      console.log("Password does not match");
      return res.status(401).json({ message: "Invalid username or password." });
    }

    console.log("Generating tokens");
    const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15s",
    });
    const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    await sql`
            UPDATE users
            SET refresh_token = ${refreshToken}
            WHERE username = ${username}
        `;

    console.log("Setting cookie with refresh token");
    res.cookie("jwt", refreshToken, {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.json({ uid: foundUser[0].id, accessToken, avatar_filename: foundUser[0].avatar_filename });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { handleLogin };
