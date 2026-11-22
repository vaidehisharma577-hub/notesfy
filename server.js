const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { connection } = require("./db");
const { userRouter } = require("./routes/user.route");
const { noteRouter } = require("./routes/note.route");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// ---- API ----
app.use("/api/user", userRouter);
app.use("/api/notes", noteRouter);
app.get("/api/health", (req, res) => res.send({ ok: true }));
app.use("/api", (req, res) => res.status(404).send({ msg: "Not found" }));

// ---- Frontend (pre-built into ./public) ----
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  try {
    await connection;
    console.log("✅ DB Connected");
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
  }
  console.log(`🚀 Notesfy running at http://localhost:${PORT}`);
});
