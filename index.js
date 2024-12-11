const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const corsOptions = require('./src/config/corsOptions');
const userRouter = require('./src/routes/users');
const loginRouter = require('./src/routes/login');
const refreshRouter = require('./src/routes/refresh');
const petsRouter = require('./src/routes/pets'); // Importuje router obsługujący wizyty zwierząt
const logoutRouter = require('./src/routes/logout');
const registerRouter = require('./src/routes/register');
const verifyRouter = require('./src/routes/verify');
const passwordResetRouter = require('./src/routes/password-reset'); 
const passwordChange = require('./src/routes/password-change');
const { APP_PORT, API_ROUTE, AVATARS_USERS_DIR, AVATARS_PETS_DIR } = require('./config');

const app = express();

// Middleware konfigurujące CORS, JSON i cookie parser
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Logowanie URL każdej przychodzącej żądania
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Serwowanie statycznych plików (zdjęć użytkowników i zwierząt)
app.use(`${API_ROUTE}/users/avatars`, express.static(AVATARS_USERS_DIR)); // Statyczna do zdjęć userów
app.use(`${API_ROUTE}/pets/avatars`, express.static(AVATARS_PETS_DIR)); // Do zdjęć zwierząt

// Routowanie API
app.use(`${API_ROUTE}/users`, userRouter);
app.use(`${API_ROUTE}/login`, loginRouter);
app.use(`${API_ROUTE}/refresh`, refreshRouter);
app.use(`${API_ROUTE}/logout`, logoutRouter);
app.use(`${API_ROUTE}/pets`, petsRouter);  // Obsługuje endpointy wizyt
app.use(`${API_ROUTE}/register`, registerRouter);
app.use(`${API_ROUTE}/verify`, verifyRouter);
app.use(`${API_ROUTE}/password-reset`, passwordResetRouter);
app.use(`${API_ROUTE}/change-password`, passwordChange);

// Globalny middleware do obsługi błędów (np. błąd bazy danych)
app.use((err, req, res, next) => {
  console.error(err); // Logowanie błędu na serwerze
  res.status(500).json({ message: 'Wystąpił błąd serwera.' }); // Wysyłanie odpowiedzi z błędem
});

app.listen(APP_PORT, () => {
  console.log(`App listening on port ${APP_PORT}`);
});
