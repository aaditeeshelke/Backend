// models/Purchase.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseSchema = new Schema({
  user: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      fullName: {
        type: String,
        required: true
      },
      username: {
        type: String,
        required: true
      }
    },
    required: true
  },
  book: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        required: true
      },
      bookName: {
        type: String,
        required: true
      },
      totalCopies: {
        type: Number,
        required: true
      },
      purchasedCopies: {
        type: Number,
        required: true
      }
    },
    required: true
  },
  publisher: {
    type: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Publisher',
        required: true
      },
      publisherName: {
        type: String,
        required: true
      }
    },
    required: true
  },
  author: {
    type: {
      authorName: {
        type: String,
        required: true
      }
    },
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    required: true
  }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
