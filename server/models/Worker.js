// server/models/Worker.js
const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    default: "" // Left blank when admin registers them
  }
});

module.exports = mongoose.model('Worker', WorkerSchema);
