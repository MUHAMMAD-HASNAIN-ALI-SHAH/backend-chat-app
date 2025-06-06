const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db.js");
const PORT = process.env.PORT || 8081;
const CLIENT_URL = process.env.CLIENT_URL;
const { app, server } = require("./config/socket.js");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/auth", require("./routes/auth.route.js"));

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on PORT : ${PORT}`);
  });
});
