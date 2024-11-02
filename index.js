const express = require('express');
const { APP_PORT, API_ROUTE } = require('./config');
const userRouter = require('./src/routes/users');
const authRouter = require('./src/routes/auth');
const refreshRouter = require('./src/routes/refresh'); 
const logoutRouter = require('./src/routes/logout');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(`${API_ROUTE}/users`, userRouter);
app.use(`${API_ROUTE}/auth`, authRouter);
app.use(`${API_ROUTE}/refresh`, refreshRouter);
app.use(`${API_ROUTE}/logout`, logoutRouter);

app.listen(APP_PORT, () => {
  console.log(`App listening on port ${APP_PORT}`);
});