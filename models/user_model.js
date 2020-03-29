// Mongoose User
let mongoose = require('mongoose');

let Schema = mongoose.Schema;
let userSchema = new Schema({
   username: {
      type: String,
      unique: true,
      index: true
   },
   email: String,
   hashedPassword: String,
}, {
   collection: 'users'
});
let User = mongoose.model('user', userSchema);

module.exports = User;