const mongoose = require('mongoose');

const HolidaysSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
});

const HolidaysModel = mongoose.model('Holidays', HolidaysSchema);
module.exports = HolidaysModel;
