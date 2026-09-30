// server/seedadmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  try {
    console.log("Connecting to cloud database to seed admin...");
    await mongoose.connect(process.env.MONGO_URI);

    // Set your admin username and password here
    const username = "admin";
    const password = "adminpassword123"; 

    // Deletes any old admin accounts to prevent duplicates
    await Admin.deleteMany({});

    // Enrypts the password securely before sending it to the cloud
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new admin to MongoDB Atlas
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();

    console.log("=========================================");
    console.log("🎉 Admin account injected into MongoDB!");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log("=========================================");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedAdmin();
