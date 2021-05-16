var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  lishogiName: {
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
