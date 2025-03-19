const User = require('../models/User');
const jwt = require("jsonwebtoken");

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const userData = async (req, res) => {
  try {
    // Get token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).send({ error: 'Authorization token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userEmail = decoded.email;

    // Fetch the user based on the email in the decoded token
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    return res.status(200).send({ status: 'Ok', data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to authenticate token' });
  }
};
const updateUserLocation = async (req, res) => {
  const { userId, latitude, longitude, city } = req.body;
  console.log('city', city)
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's location
    user.location = { latitude, longitude };
    user.city = city;
    await user.save();

    res.status(200).json({ message: 'User location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, userData, updateUserLocation };
