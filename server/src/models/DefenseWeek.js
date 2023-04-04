const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DefenseWeekSchema = new Schema({
    by: {
        type: Schema.Types.ObjectId,
        ref: 'Administrator',
        required: true
    },
    dates: [{
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    }],
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    term: { type: Schema.Types.ObjectId, required: true, ref: 'Term' },
    phase: Number
});

const DefenseWeek = mongoose.model('DefenseWeek', DefenseWeekSchema);

module.exports = DefenseWeek;
