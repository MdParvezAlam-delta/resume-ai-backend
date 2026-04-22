const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config()                                        // so this .config method helps to access the data of env files in all over the express server 
const app = require("./src/app")
const connectToDB = require("./src/config/database")
connectToDB()
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

