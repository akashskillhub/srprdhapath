const mongoose = require('mongoose');

const SolvedQuestionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
  },
  subject: String,
  topic: String, // Used for chapter name in Practice Hub
  isCorrect: Boolean,
  solvedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for faster queries on user progress
SolvedQuestionSchema.index({ userId: 1, solvedAt: -1 });

module.exports = mongoose.model('SolvedQuestion', SolvedQuestionSchema);
