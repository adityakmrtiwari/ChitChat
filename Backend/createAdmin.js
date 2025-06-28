const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Validate required env variables
    const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } = process.env;

    if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_USERNAME) {
      throw new Error('Missing required environment variables. Please check .env file.');
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      process.exit(0);
    }

    // Create hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create new admin user
    const adminUser = new User({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`👤 Username: ${ADMIN_USERNAME}`);
    console.log('🔒 Password: [HIDDEN] - Stored securely via .env');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();
