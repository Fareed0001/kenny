const jwt = require('jsonwebtoken');
require("dotenv").config();

class TokenGenerator {
    generateAdminToken = function(user) {
        const { _id, email} = user;
        return jwt.sign({
            uid: _id,
            email: email
        }, process.env.JWT_ADMIN_SECRET, {expiresIn: `${process.env.JWT_SECRET_VALIDITY}`});
    }

    generateAgentToken = function(user) {
        const { _id,email,role} = user;
        return jwt.sign({
            uid: _id,
            email: email,
            role: role
        }, process.env.JWT_TUTOR_SECRET, {expiresIn: `${process.env.JWT_SECRET_VALIDITY}`});
    }

    generateStudentToken = function(user) {
        const { _id,email, role} = user;
        return jwt.sign({
            uid: _id,
            email: email,
            role: role
        }, process.env.JWT_STUDENT_SECRET, {expiresIn: `${process.env.JWT_SECRET_VALIDITY}`});
    }
    generateInstructorToken = function(user) {
        const { _id,email} = user;
        return jwt.sign({
            uid: _id,
            email: email
        }, process.env.JWT_INSTRUCTOR_SECRET, {expiresIn: `${process.env.JWT_SECRET_VALIDITY}`});
    }
}

module.exports = new TokenGenerator();
