const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: {
    latitude: { type: Number, },
    longitude: { type: Number, },
  },
  city: { type: String }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
