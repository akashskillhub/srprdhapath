const mongoose = require('mongoose');

const ShortTrickSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Path to the image
    default: null,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ShortTrick', ShortTrickSchema);
