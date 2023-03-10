// This file uses better-sqlite3 to create a database that can store its volumes on the local system. This allows synchronous database transactions.
const Database = require('better-sqlite3');
const db = new Database('people.db', { verbose: console.log });
// db.pragma('journal_mode = WAL');

// These lines declare the query command to make a table in the database people.db if there isn't one already and execute that query.
const makePeopleTable =
  'CREATE TABLE IF NOT EXISTS people ( personName VARCHAR(255), image BLOB);';
// const makeOrganizationsTable =
//   'CREATE TABLE IF NOT EXISTS organiztions ( name VARCHAR(255), batchImage BLOB);';
db.exec(makePeopleTable);
// db.exec(makeOrganiztionsTable);

module.exports = db;
