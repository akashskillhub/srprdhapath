const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // Description or simple text content
  },
  fileUrl: {
    type: String, // URL to PDF or Image
  },
  type: {
    type: String,
    enum: ['PDF', 'IMAGE', 'TEXT', 'LINK'],
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
