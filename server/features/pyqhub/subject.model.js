const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Admin can add subjects like इतिहास, भूगोल, etc.
    }
}, { timestamps: true });

module.exports = mongoose.model('PYQSubject', SubjectSchema);
