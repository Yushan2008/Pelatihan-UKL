const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
connectDB();

app.use(express.json());

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/users", require("./routes/user.route"));
app.use("/api/attendance", require("./routes/attendance.route"));

app.listen(process.env.PORT, () => console.log(`✅ Server running on port ${process.env.PORT}`));
