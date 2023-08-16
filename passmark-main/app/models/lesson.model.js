const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema(
    {
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        default:'',
        required: false,
    },
    document: {
        type: String,
        required: false,
        default: ''
    },
    type: {
        type: String,
        default:'',
        required: false
    },
    course: {
        type: mongoose.Types.ObjectId, 
        ref: "Course",
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Lesson', lessonSchema);