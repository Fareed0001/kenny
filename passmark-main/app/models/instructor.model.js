const mongoose = require('mongoose');


const instructorSchema = mongoose.Schema(
    {
    firstname: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },
    lastname: {
        type: String,
        required: true,
        trim:true,
        default: ''
    },
    photo: {
        type: String,
        required: false,
        default: ''
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        select:false
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Instructor', instructorSchema);