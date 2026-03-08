const mongoose = require('mongoose');

const messSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  capacity: { type: Number, required: true },
  established: { type: Number },
  phone: { type: String },
  address: { type: String },
  logo: { type: String, default: '' },
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, strict: true });

module.exports = mongoose.model('Mess', messSchema);
