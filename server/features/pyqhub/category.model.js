const mongoose = require('mongoose');

// Main Root Categories: ALL QUESTIONS, SUBJECT WISE, YEAR WISE
const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['ALL QUESTIONS', 'SUBJECT WISE', 'YEAR_WISE'], // Using underscore for DB consistency
    }
}, { timestamps: true });

module.exports = mongoose.model('PYQCategory', CategorySchema);
