const mongoose = require('mongoose');

const enrollmentSchema = mongoose.Schema(
    {
    course: {
        type: mongoose.Types.ObjectId, 
        ref: "Course",
        required: true
    },
    user_id: {
        type: String,
        required: true
        },
    user_type: {
            type: String,
            required: true
        },
    status: {
        type: String,
        default:'active',
        required: false
    },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);