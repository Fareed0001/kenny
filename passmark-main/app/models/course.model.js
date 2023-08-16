const mongoose = require('mongoose');

const courseSchema = mongoose.Schema(
    {
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default:'',
        required: false,
    },
    student_price: {
        type: Number,
        required: false,
        default: 0
    },
    agent_price: {
        type: Number,
        required: false,
        default: 0
    },
    cover_image: {
        type: String,
        default:'',
        required: false
    },
    duration: {
        type: Number,
        required: false,
        default: 0
    },
    instructor:  {
        type: mongoose.Types.ObjectId, 
        ref: "Instructor",
        required: false,
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Course', courseSchema);