require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("./models/index");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth",         require("./routes/auth.routes"));
app.use("/api/appointments", require("./routes/appointments.routes"));
app.use("/api/admin",        require("./routes/admin.routes"));
app.use("/api/user",         require("./routes/user.routes"));
app.use("/api/ocr",          require("./routes/ocr.routes"));

app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Critical Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

const PORT = process.env.PORT || 3001;
sequelize.sync().then(() => {
  console.log("Base de données synchronisée");
  app.listen(PORT, () => console.log(`API lancée sur http://localhost:${PORT}`));
}).catch(err => console.error("Erreur DB:", err));
