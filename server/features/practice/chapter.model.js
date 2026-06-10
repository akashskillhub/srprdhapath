const mongoose = require('mongoose');

const PracticeChapterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'PracticeSubject', required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PracticeChapter', PracticeChapterSchema);
