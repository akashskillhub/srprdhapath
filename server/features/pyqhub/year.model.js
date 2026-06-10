const mongoose = require('mongoose');

const YearSchema = new mongoose.Schema({
    yearValue: {
        type: Number,
        required: true,
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PYQGroup',
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('PYQYear', YearSchema);
