// models/publisher.js
const mongoose = require('mongoose');

// MongoDB schema for books
const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  imgUrl: { type: String, required: true },
  description: { type: String, required: true },
  publisherDate: { type: Date, required: true },
  totalCopies: { type: Number, required: true },
  purchasedCopies: { type: Number, default: 0 }
});

// MongoDB schema for authors
const authorSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  books: [bookSchema]
});

// MongoDB schema for publishers
const publisherSchema = new mongoose.Schema({
  publisherName: { type: String, required: true },
  authors: [authorSchema]
});

const Publisher = mongoose.model('Publisher', publisherSchema);

module.exports = Publisher;