const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChecklistSchema = new Schema({
    thesis: {
        type: Schema.Types.ObjectId,
        ref: 'Thesis',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    
});

const Checklist = mongoose.model('Checklist', ChecklistSchema);
module.exports = Checklist;
