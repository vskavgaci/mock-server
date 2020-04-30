var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var mockSchema = new Schema({
    name: String,
    user_id: String,
    route: String,
    method: String,
    response_code: String,
    request: String,
    response: String,
    date: String,
    status: String,
    count: Number
});

module.exports = mongoose.model("mocks", mockSchema);
