const mongoose = require('mongoose');


const agentSchema = mongoose.Schema(
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
    company: {
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
    account_status: {
        type: String,
        default:'pending',
    },
    role: {
        type: String,
        required: false,
        default: 'agent',
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Agent', agentSchema);