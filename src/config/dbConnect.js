const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("DB connected successfully");

    connection.release();
  } catch (error) {
    console.log("MYSQL CONNECTION ERROR:", error.message);
  }
};

testConnection();

module.exports = pool;
// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_NAME:", process.env.DB_NAME);


// connection.connect((err) => {
//   if (err) {
//     console.log("MYSQL ERROR:", err.message);
//     return;
//   }

//   console.log("DB connected successfully");
// });
