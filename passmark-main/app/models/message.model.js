const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
    title: {
        type: String,
        default:'',
        required: true
    },
    instructor: {
        type: String,
        default:'',
        required: false,
    },
    description: {
        type: String, 
        default:'',
        required: false
    },
    course:  {
        type: mongoose.Types.ObjectId, 
        ref: "Course",
        required: true,
    },
    user_id: {
        type: String,
        default:'',
        required: true
    },
    messsage_type: {
        type: String,
        default:'normal', // normal || meeting
        required: false
    },
    link: {
        type: String,
        default:'',
        required: false,
    },
    password: {
        type: String,
        default:'',
        required: false,
    },
    date: {
        type: String,
        default:'',
        required: false
    },
    time: {
        type: String,
        default:'',
        required: false
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Message', messageSchema);