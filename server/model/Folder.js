const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  category: {
    type: String,
    enum: ['PYQ_HUB', 'SUBJECT_WISE', 'YEAR_WISE', 'ALL_QUESTIONS', 'MODULE', 'SHORT_TRICKS', 'STATE_BOARD', 'SYLLABUS', 'YOUTUBE', 'QUESTION_PAPER'],
    required: true,
  },
  isFinal: { // If true, questions are stored here
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Folder', FolderSchema);
