const mysql = require("mysql");
require('dotenv').config();
const host = process.env.host;
const user = process.env.user;
const password = process.env.password;
const database = process.env.database;

const connection = mysql.createConnection({
  host: host,
  user: user,
  password: password,
  database:database
  
})
connection.connect(function (err) {
  if (err) {
    console.log(err)
  }
  else {
    console.log("connected")
  }
})

  module.exports = connection