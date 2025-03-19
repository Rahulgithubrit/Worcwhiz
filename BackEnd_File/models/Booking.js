const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  status: { type: String, enum: ['Booked', 'in-progress', 'Completed'], default: 'pending' },
  bookingDate: { type: Date, default: Date.now },
  otp: { type: String, required: true },
  startTime: { type: Date },  // Time when booking is confirmed (status: 'Booked')
  endTime: { type: Date },  // Time when work is completed (status: 'Completed')
  totalCost: { type: Number, default: 0 },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
