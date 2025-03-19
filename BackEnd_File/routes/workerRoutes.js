const express = require('express');
const router = express.Router();
const { getWorkers, workerData, updateWorkerStatus, updateLocation, updateWorkerRate, saveFCMToken } = require('../controller/workerController');
const { registerWorker, loginUser } = require('../controller/authController');

// Worker Registration
router.post('/registerWorker', registerWorker);

// Worker Login
router.post('/login', loginUser);

router.post('/save-worker-token', saveFCMToken);

router.get('/worker-data', workerData)

router.get('/workers', getWorkers);

router.put('/update-status', updateWorkerStatus);

router.put('/update-location/worker', updateLocation);

router.put('/update-rate', updateWorkerRate);

module.exports = router;
