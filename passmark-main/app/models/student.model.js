const mongoose = require('mongoose');


const studentSchema = mongoose.Schema(
    {
    firstname: {
        type: String,
        required: true,
        trim: true,
    },
    lastname: {
        type: String,
        required: true,
        trim:true
    },
    phone: {
        type: String,
        required: true,
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
    photo: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: 'student',
    },
    referred_by: {
        type: mongoose.Types.ObjectId, 
        ref: "Agent",
        required: false
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Student', studentSchema);