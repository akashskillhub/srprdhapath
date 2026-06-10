const mongoose = require('mongoose');

const TestQuestionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  question: { type: String, required: true },
  questionImage: { type: String, default: '' },
  options: { type: [String], required: true, validate: v => v.length === 4 },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 }, // index 0-3
  explanation: { type: String, default: '' },
  explanationImage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('TestQuestion', TestQuestionSchema);
