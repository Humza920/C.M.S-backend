const dotenv = require("dotenv")
const connectionWithDb = require("./src/config/db")
const app = require("./src/app")
dotenv.config()
connectionWithDb()

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`🚀 Server running`)
)