const express = require("express");
const dotenv = require("dotenv");
const db = require("./src/config/dbConnect");
const authRoutes = require('./src/routes/authRoute');
const documentRoutes = require("./src/routes/documentRoute");

dotenv.config();

const app = express();

const port = process.env.SERVER_PORT || 4000;

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/documents", documentRoutes);


app.get("/api/health", (req, res) => {
  res.status(200).send({
    success: true,
    message: "Document Platform API is running",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});