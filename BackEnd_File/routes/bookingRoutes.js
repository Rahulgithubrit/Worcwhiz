const express = require('express');
const router = express.Router();
const { createBooking, getBookingsForUser, getBookingsForWorker, cancelBooking, verifyOTP, completeBooking, getCompletedBookingsForWorker } = require('../controller/bookingController');

router.post('/book', createBooking);
router.get('/bookings/user/:userId', getBookingsForUser);
router.get('/bookings/worker/:workerId', getBookingsForWorker);
router.get('/bookings-complete/worker/:workerId', getCompletedBookingsForWorker);
router.delete('/cancel-booking/:bookingId', cancelBooking);
router.post('/verify-otp', verifyOTP);
router.post('/complete/:bookingId', completeBooking);

module.exports = router;
