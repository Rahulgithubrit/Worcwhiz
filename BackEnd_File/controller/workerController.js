const Worker = require('../models/Worker');
const jwt = require("jsonwebtoken");

// const getWorkers = async (req, res) => {
//   try {
//     const workers = await Worker.find();
//     res.json(workers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
const getWorkers = async (req, res) => {
  const { city } = req.query;
  console.log('worker', city)
  try {
    let workers;
    if (city) {
      workers = await Worker.find({ city: city });
    } else {
      workers = await Worker.find();
    }
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const workerData = async (req, res) => {
  try {
    // Get token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).send({ error: 'Authorization token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;

    // Fetch the user based on the email in the decoded token
    const user = await Worker.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    return res.status(200).send({ status: 'Ok', data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to authenticate token' });
  }
};
const updateWorkerStatus = async (req, res) => {
  const { workerId, isActive } = req.body;
  try {
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    worker.isActive = isActive;  // Update status
    await worker.save();

    // Emit status change to all connected clients
    global.io.emit('workerStatusUpdated', {
      workerId: worker._id,
      isActive: worker.isActive
    });

    res.status(200).json({ message: 'Worker status updated successfully', worker });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//adding location
const updateLocation = async (req, res) => {
  const { workerId, latitude, longitude, city } = req.body;
  console.log('city', city)
  try {
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Update the worker's location
    worker.location = { latitude, longitude };
    worker.city = city;
    await worker.save();

    res.status(200).json({ message: 'Worker location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkerRate = async (req, res) => {
  const { workerId, ratePerHour } = req.body;

  try {
    const worker = await Worker.findByIdAndUpdate(workerId, { ratePerHour }, { new: true });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.status(200).json({ message: 'Rate updated successfully', worker });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveFCMToken = async (req, res) => {
  const { workerId, fcmToken } = req.body;

  try {
    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });

    worker.fcmToken = fcmToken;  // Save the token to the worker's document
    await worker.save();

    res.status(200).json({ message: 'FCM token saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


module.exports = { getWorkers, workerData, updateWorkerStatus, updateLocation, updateWorkerRate, saveFCMToken };
