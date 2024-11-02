const express = require('express');
const { APP_PORT, API_ROUTE } = require('./config');
const userRouter = require('./src/routes/users'); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(`${API_ROUTE}/users`, userRouter);

app.listen(APP_PORT, () => {
  console.log(`App listening on port ${APP_PORT}`);
});