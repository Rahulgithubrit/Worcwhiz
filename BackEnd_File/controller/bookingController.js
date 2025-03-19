const Booking = require('../models/Booking');
const Worker = require('../models/Worker');


const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Random 4-digit OTP
};


const createBooking = async (req, res) => {
  const { userId, workerId } = req.body;

  try {
    const otp = generateOTP();

    const newBooking = new Booking({
      user: userId,
      worker: workerId,
      otp: otp,
      status: 'in-progress',
    });

    await newBooking.save();

    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.isActive = false;  // Set the worker's status to inactive
      await worker.save();  // Save the updated worker status
    }

    global.io.emit('workerStatusUpdated', {
      workerId: worker._id,
      isActive: worker.isActive
    });

    // Emit the booking notification to the worker via Socket.IO
    global.io.emit('workerBooked', newBooking);

    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getBookingsForUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const bookings = await Booking.find({ user: userId }).populate('worker');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bookings for a worker
const getBookingsForWorker = async (req, res) => {
  const workerId = req.params.workerId;

  try {
    const bookings = await Booking.find({
      worker: workerId,
      status: { $in: ['Booked', 'in-progress'] }
    }).populate('user');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get all data of booking for worker 
const getCompletedBookingsForWorker = async (req, res) => {
  const workerId = req.params.workerId;

  try {
    const bookings = await Booking.find({
      worker: workerId,
      status: { $in: ['Completed'] }
    }).populate('user');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking by ID and delete it
    const booking = await Booking.findByIdAndDelete(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json({ message: 'Booking canceled successfully' });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: 'Error deleting booking' });
  }
};

const verifyOTP = async (req, res) => {
  const { bookingId, enteredOtp } = req.body;

  console.log(enteredOtp)

  try {
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the entered OTP matches the stored OTP
    if (booking.otp === enteredOtp) {
      booking.status = 'Booked';
      booking.startTime = new Date();
      await booking.save();

      // const worker = await Worker.findById(booking.worker);
      // if (!worker) {
      //   return res.status(404).json({ message: 'Worker not found' });
      // }

      // // Set worker's status to inactive
      // worker.isActive = false;
      // await worker.save();

      // // Emit status change for worker
      // global.io.emit('workerStatusUpdated', {
      //   workerId: worker._id,
      //   isActive: worker.isActive
      // });

      global.io.emit('bookingStatusUpdated', {
        bookingId: booking._id,
        status: 'Booked',
        startTime: booking.startTime
      });

      return res.status(200).json({ message: 'OTP verified, worker can start the work.' });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error while verifying OTP' });
  }
};

const completeBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking status is 'in-progress' before allowing completion
    if (booking.status !== 'Booked') {
      return res.status(400).json({ message: 'Booking is not Booked' });
    }

    // Update the booking status to 'completed'
    booking.status = 'Completed';
    booking.endTime = new Date();
    const worker = await Worker.findById(booking.worker);
    const timeSpentInHours = (booking.endTime - booking.startTime) / (1000 * 60 * 60);
    const workerCost = worker.ratePerHour * timeSpentInHours;
    // Add platform fee (10%)
    const platformFee = workerCost * 0.10; // 10% platform fee
    // const totalCost = workerCost + platformFee;
    // booking.totalCost = totalCost;
    const totalCost = (workerCost + platformFee).toFixed(1);
    booking.totalCost = parseFloat(totalCost);
    await booking.save();

    worker.isActive = true;
    await worker.save();

    // Emit the booking status and worker status updates
    global.io.emit('workerStatusUpdated', {
      workerId: worker._id,
      isActive: worker.isActive
    });

    global.io.emit('bookingStatusUpdated', {
      bookingId: booking._id,
      status: 'Completed',
      totalCost: booking.totalCost,
      endTime: booking.endTime
    });


    res.status(200).json({ message: 'Booking marked as completed', total: totalCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error completing the booking' });
  }
};

module.exports = { createBooking, getBookingsForUser, getBookingsForWorker, cancelBooking, verifyOTP, completeBooking, getCompletedBookingsForWorker };
