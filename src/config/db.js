const mongoose = require("mongoose");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectionWithDb() {
  if (cached.conn) {
    console.log("✅ MongoDB: Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("⏳ MongoDB: Creating new connection...");
    cached.promise = mongoose.connect(process.env.URL_OF_DATABASE)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connected");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectionWithDb;
