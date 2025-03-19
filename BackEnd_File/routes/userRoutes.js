const express = require('express');
const router = express.Router();
const { getUsers, userData, updateUserLocation } = require('../controller/userController');
const { registerUser, loginUser } = require('../controller/authController');

// User Registration
router.post('/registerUser', registerUser);

// User Login
router.post('/login', loginUser);

router.get('/user-data', userData)
router.get('/users', getUsers);

router.put('/update-location/user', updateUserLocation);

module.exports = router;
