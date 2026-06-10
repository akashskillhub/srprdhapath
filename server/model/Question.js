const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  options: [{
    text: String,
    isCorrect: Boolean,
  }],
  explanation: {
    text: String,
    image: String,
  },
  subject: {
    type: String,
    default: 'General',
  },
  topic: String,
  subTopic: String,
  type: {
    type: String,
    enum: ['PYQ', 'PRACTICE', 'TEST_SERIES'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'MEDIUM',
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    default: 'ALL QUESTIONS',
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  yearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
