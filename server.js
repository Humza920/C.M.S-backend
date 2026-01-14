const app = require("./src/app")
console.log("MONGO_URI =>", process.env.URL_OF_DATABASE);

const port = process.env.PORT || 5000

app.listen(port, () => console.log(`🚀 Server running`)
)