const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;  // Get URI from .env
    console.log(mongoURI)

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in the environment variables');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);  // Exit the process with failure
  }
};

module.exports = connectDB;
