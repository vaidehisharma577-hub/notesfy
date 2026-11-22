const mongoose = require("mongoose");
require("dotenv").config();

const url = process.env.mongourl || process.env.MONGO_URL;
if (!url) {
  console.error("\n❌ MongoDB URL missing. Copy .env.example to .env and set mongourl=...\n");
  process.exit(1);
}

const connection = mongoose.connect(url);
module.exports = { connection };
