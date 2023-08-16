const mongoose = require('mongoose');

const classSchema = mongoose.Schema(
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
        required: true
    },
    course:  {
        type: mongoose.Types.ObjectId, 
        ref: "Course",
    },
    video: {
        type: String,
        default:'',
        required: false
    },
    resource: {
        type: String,
        default:'',
        required: false
    },
    // class_type: {
    //     type: String,
    //     default:'normal', /// normal || online
    //     required: false
    // },
    // date: {
    //     type: String,
    //     default:'',
    //     required: false
    // },
    // time: {
    //     type: String,
    //     default:'',
    //     required: false
    // },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Class', classSchema);