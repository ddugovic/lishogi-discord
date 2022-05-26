var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  playerId: {
    type: String,
    required: true
  },
  lidraughtsName: {
    type: String,
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  favoriteMode: {
    type: String
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;
