const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profession: { type: String, required: true },
  password: String,
  experience: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  ratePerHour: { type: Number, required: true, default: 0 },
  fcmToken: {
    type: String,
    required: false,
  },
  city: { type: String }
});

const Worker = mongoose.model('Worker', workerSchema);
module.exports = Worker;
