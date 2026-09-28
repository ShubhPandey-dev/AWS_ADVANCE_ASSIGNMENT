const bcrypt = require("bcrypt");
const db = require("../config/dbConnect");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const data = req.body;

    const hashed_pwd = await bcrypt.hash(data.password, 10);

    const values = [
      data.id,
      data.name,
      data.email,
      hashed_pwd,
    ];

    const query = `
      INSERT INTO users
      (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, values);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const data = req.body;

    const query = `
      SELECT *
      FROM users
      WHERE email = ?
    `;

    const [result] = await db.execute(query, [data.email]);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result[0];

    const passwordMatch = await bcrypt.compare(
      data.password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
};