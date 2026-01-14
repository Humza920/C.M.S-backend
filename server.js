const dotenv = require("dotenv");
dotenv.config();

const connectionWithDb = require("./src/config/db");
const app = require("./src/app");

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectionWithDb();   // ⬅️ MUST WAIT
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

startServer();
