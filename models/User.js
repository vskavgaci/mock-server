var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    date: String,
    type: String,
    locale: String
});

module.exports = mongoose.model("users", userSchema);
