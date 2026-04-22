const mongoose = require("mongoose");

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);                                       // The process object in Node.js is a global object that gives you information about the current running Node process and control over it
    console.log("Connected to the database");
  } catch (err) {
    console.log(err);
  }
}

module.exports = connectToDB;
