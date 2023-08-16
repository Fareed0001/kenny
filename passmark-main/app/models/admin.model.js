const mongoose = require('mongoose');


const adminSchema = mongoose.Schema(
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

// adminSchema.method("toJSON", function () {
//     const { __v, _id, password, ...object } = this.toObject();
//     object.uid = _id;
//     return object;
//   });

// adminSchema.methods.generateAuthToken = function() {
//     return jwt.sign({
//         uid: this._id,
//         email: this.email
//     }, process.env.JWT_SECRET || 'AdminSignKey23', {expiresIn: `${process.env.JWT_SECRET_VALIDITY}`});
// } 


module.exports = mongoose.model('Admin', adminSchema);