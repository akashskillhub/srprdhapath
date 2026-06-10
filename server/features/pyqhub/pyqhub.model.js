const mongoose = require('mongoose');

const PYQHubFolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PYQHubFolder',
    default: null,
  },
  // Specific fields for PYQ Hub could go here
  year: {
    type: Number,
  },
  examType: {
    type: String,
  },
  isFinal: { // If true, questions are stored here
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('PYQHubFolder', PYQHubFolderSchema);
