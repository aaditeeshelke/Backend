const mongoose = require('mongoose');
const { Schema } = mongoose;

const purchasedBookSchema = new Schema({
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  totalCopiesAvailable: {
    type: Number,
    required: true,
  },
  // Add more fields as needed
});

const userSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginTimes: [{
    type: Date,
    default: null
  }],
  logoutTimes: [{
    type: Date,
    default: null
  }],
  purchasedBooks: [purchasedBookSchema], // Array to store purchased books
});

module.exports = mongoose.model('User', userSchema);