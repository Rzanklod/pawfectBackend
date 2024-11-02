const postgres = require('postgres');
const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_PASSWORD, POSTGRES_USERNAME, POSTGRES_DB_NAME } = require('../../config');

const sql = postgres(`postgres://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB_NAME}`);

module.exports = sql;