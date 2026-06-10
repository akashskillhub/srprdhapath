const mongoose = require('mongoose');

const PYQGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    subtitle: {
        type: String,
        default: 'Browse Exams'
    },
    icon: {
        type: String,
        default: 'folder-outline'
    },
    color: {
        type: String,
        default: '#8B5CF6'
    }
}, { timestamps: true });

module.exports = mongoose.model('PYQGroup', PYQGroupSchema);
