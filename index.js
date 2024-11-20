const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOptions = require('./src/config/corsOptions');
const userRouter = require('./src/routes/users');
const loginRouter = require('./src/routes/login');
const refreshRouter = require('./src/routes/refresh'); 
const petsRouter = require('./src/routes/pets');
const logoutRouter = require('./src/routes/logout');
const registerRouter = require('./src/routes/register');
const verifyRouter = require('./src/routes/verify');
const { APP_PORT, API_ROUTE, AVATARS_USERS_DIR, AVATARS_PETS_DIR } = require('./config');

const app = express();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.originalUrl);
  next();
})

app.use(`${API_ROUTE}/users/avatars`, express.static(AVATARS_USERS_DIR)); // statyczna do zdjec userow
app.use(`${API_ROUTE}/pets/avatars`, express.static(AVATARS_PETS_DIR)); // do petow

app.use(`${API_ROUTE}/users`, userRouter);
app.use(`${API_ROUTE}/login`, loginRouter);
app.use(`${API_ROUTE}/refresh`, refreshRouter);
app.use(`${API_ROUTE}/logout`, logoutRouter);
app.use(`${API_ROUTE}/pets`, petsRouter);
app.use(`${API_ROUTE}/register`, registerRouter); 
app.use(`${API_ROUTE}/verify`, verifyRouter);

app.listen(APP_PORT, () => {
  console.log(`App listening on port ${APP_PORT}`);
});
