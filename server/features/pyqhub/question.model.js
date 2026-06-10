const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        validate: [arr => arr.length === 4, 'Must have exactly 4 options'],
        required: true,
    },
    correctAnswer: {
        type: String,
        required: true,
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PYQSubject',
        default: null,
    },
    yearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PYQYear',
        default: null,
    },
    category: {
        type: String, // Root Categories: 'ALL QUESTIONS', 'SUBJECT WISE', 'YEAR WISE'
        required: true,
        enum: ['ALL QUESTIONS', 'SUBJECT WISE', 'YEAR_WISE'],
    },
    questionImage: {
        type: String, // Path to the image
        default: null,
    },
    explanationText: {
        type: String, // Correct explanation
        default: null,
    },
    explanationImage: {
        type: String, // Path to explanation image
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('PYQQuestion', QuestionSchema);
