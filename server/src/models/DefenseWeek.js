const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseWeekSchema = new Schema({
    dates: [Date],      // Dates available for the defense
    phase: Number,      // Which phase
    duration: Number,   // How long each defense will be
});

const DefenseWeek = mongoose.model('DefenseWeek', DefenseWeekSchema);

module.exports = DefenseWeek;
