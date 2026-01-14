const mongoose = require("mongoose");

const connectionWithDb = async () => {
  try {
    await mongoose.connect(process.env.URL_OF_DATABASE);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectionWithDb;
