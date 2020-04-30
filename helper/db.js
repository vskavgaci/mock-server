var mongoose = require("mongoose");

module.exports = () => {
  mongoose.connect(process.env.MONGO_SERVER, { useNewUrlParser: true, useUnifiedTopology: true });

  mongoose.connection.on('open', () => {
    console.log('MongoDB: Connected');
  });
  mongoose.connection.on('error', (err) => {
    console.log('MongoDB: Error', err);
  });

  mongoose.Promise = global.Promise;
}
