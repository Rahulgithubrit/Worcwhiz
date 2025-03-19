const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');

// User Registration
const registerUser = async (req, res) => {
  const { name, mobileNumber, email, password, userType } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      mobileNumber,
      email,
      password: hashedPassword,
      userType
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerWorker = async (req, res) => {
  const { name, email, mobileNumber, password, userType, experience, profession } = req.body;

  const oldWorker = await Worker.findOne({ email: email });

  if (oldWorker) {
    console.log('data')
    return res.send({ data: "User already exists!!" });
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    await Worker.create({
      name: name,
      email: email,
      mobileNumber,
      password: encryptedPassword,
      userType,
      experience,
      profession
    });
    res.send({ status: "ok", data: "User Created" });
  } catch (error) {
    res.send({ status: "error", data: error });
  }
}


// User Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Try to find the user or worker by email
    const oldUser = await User.findOne({ email: email }) || await Worker.findOne({ email: email });

    if (!oldUser) {
      return res.status(400).send({ data: "User doesn't exist!" });
    }

    // If it's a user, check password
    if (oldUser.password && await bcrypt.compare(password, oldUser.password)) {
      const jwt_token = process.env.JWT_SECRET;

      // Generate token
      const token = jwt.sign(
        { email: oldUser.email, userType: oldUser.constructor.modelName },
        jwt_token,
        // { expiresIn: '96h' } // Expiration of 1 hour for the token
      );

      return res.status(200).send({
        status: "ok",
        data: token,
        userType: oldUser.constructor.modelName, // 'User' or 'Worker' depending on which model the user was found in
      });
    }

    // If worker or password does not match for user, send an error
    return res.status(400).send({ error: "Invalid credentials" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerUser, registerWorker, loginUser };
