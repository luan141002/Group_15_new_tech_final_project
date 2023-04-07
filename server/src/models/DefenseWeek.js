const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseWeekSchema = new Schema({
    dates: [Date],
    phase: Number
});

const DefenseWeek = mongoose.model('DefenseWeek', DefenseWeekSchema);

module.exports = DefenseWeek;
