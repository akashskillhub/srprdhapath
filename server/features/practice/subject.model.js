const mongoose = require('mongoose');

const PracticeSubjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, default: 'book-open-variant' },
    color: { type: String, default: '#85b1f8ff' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PracticeSubject', PracticeSubjectSchema);
