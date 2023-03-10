require('dotenv').config({ path: '../.env' });

const SQL_URI = process.env.SQL_URI;
const PORT = process.env.PORT;

module.exports = { SQL_URI, PORT };
