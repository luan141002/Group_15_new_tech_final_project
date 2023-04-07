const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseWeekSchema = new Schema({
    dates: [{
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    }],
    phase: Number
});

const DefenseWeek = mongoose.model('DefenseWeek', DefenseWeekSchema);

module.exports = DefenseWeek;
