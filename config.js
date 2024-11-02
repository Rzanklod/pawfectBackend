require('dotenv').config();

module.exports = {
    APP_PORT: process.env.APP_PORT || 3300,
    ACCES_TOKEN_SECRET: process.env.ACCES_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    API_ROUTE: process.env.API_ROUTE || '/api/v1',
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_HOST: process.env.POSTGRES_HOST || '127.0.0.1',
    POSTGRES_PORT: process.env.POSTGRES_PORT || '5432',
    POSTGRES_DB_NAME: process.env.POSTGRES_DB_NAME || 'devdb',
};