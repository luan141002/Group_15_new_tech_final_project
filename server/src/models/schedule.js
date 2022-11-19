const mongoose = require('mongoose')
const Schema = mongoose.Schema

// --------------------------------------------------------------------------------
// | type       | who can create | who can see                | seen in dashboard |
// --------------------------------------------------------------------------------
// | personal   | anyone         | students: group members,   | false             |
// |            |                |    advisers, coordinators  |                   |
// |            |                |    and admins              |                   |
// |            |                | faculty (non-coord):       |                   |
// |            |                |    group members, other    |                   |
// |            |                |    faculty                 |                   |
// |            |                | rest: all                  |                   |
// | global     | admins, coord. | all                        | true              |
// | group      | members, advs. | group only                 | true              |
// | defense    | coordinator    | all                        | true              |
// --------------------------------------------------------------------------------

const ScheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: [ 'personal', 'global', 'class', 'group', 'defense' ]
    },
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    panelists: {
        type: [Schema.Types.ObjectId],
        ref: 'Faculty'
    },
    period: {
        from: { type: Date, required: true },
        to: Date
    },
    repeating: {
        type: Boolean,
        required: true,
        default: false
    },
    repeat: String,
    time: {
        from: { type: Number, required: true },
        to: { type: Number, required: true }
    },
})

const Schedule = mongoose.model('Schedule', ScheduleSchema)
module.exports = Schedule
