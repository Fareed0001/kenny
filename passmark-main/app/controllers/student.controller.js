
const bcrypt = require('bcryptjs');
const tokenGenerator = require('../utils/tokenGenerator');
const UserRepository = require('../repositories/UserRepository')
const S3Service = require('../services/s3Service');
const ObjectId = require('mongoose').Types.ObjectId;


class StudentController {
    async create(req, res) {
        try {
            //const { firstname, lastname, email, password } = req.body;
            if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }

              //hash passwords
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const user = {...req.body, password: hashedPassword};
            const userExists = (await UserRepository.findStudentByEmail(user.email)) != null;
            if (userExists) {
                return res.status(500).json({
                    status: `error`,
                    message: "Student already exists",
                })
            }
            const savedDoctor =  await UserRepository.createStudent(user);
            const {password, ...newUser} = savedDoctor._doc;
            const token =tokenGenerator.generateStudentToken(newUser);
            return res.json({
                status: `success`,
                message: `Student created`,
                data: newUser,
                token
            })
        } catch (error) {
            return res.status(500).json(
                {
                  status: `error`,
                  message:  error.message,
              })
        }
    }

    async login(req, res){
        try {
            // const { email, password } = req.body;
            if (!req.body.email || !req.body.password) {
                return res.status(401).json(
                    {  status: `error`, message: "All fields are required" }
                    )
            }
            const user = await UserRepository.findStudentByEmail(req.body.email);
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Invalid user"
                     });
            }
            if (!await bcrypt.compare(req.body.password, user.password)){
                return res.status(401).json({ status: `error`, message: "Invalid credentials" });
            }
            const token = tokenGenerator.generateStudentToken(user);
            const {password, ...userData} = user._doc;
            return res.status(200).json({
                status: `success`,
                message: "Login successful",
                data: userData,
                token
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async getProfile(req, res){
        try {
            const user = await UserRepository.findStudentByID(new ObjectId(req.auth_id));
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Invalid user"
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Profile data retrieved",
                data:user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async enrollToCourse(req, res) {
        try {
            const courseId = new ObjectId(req.params.course_id);
            const studentId = new ObjectId(req.auth_id);
            if (!courseId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":course_id is required",
                })
            }
              //hash passwords
            const courseNotExists = (await UserRepository.findCourseByID(courseId)) == null;
            if (courseNotExists) {
                return res.json({
                    status: `error`,
                    message: "Course not found",
                })
            }
            const isEnrolled = await UserRepository.getEnrollmentToCourse(studentId, courseId);
            if (isEnrolled.length>0) {
                return res.json({
                    status: `error`,
                    message: "You have already enrolled this course",
                })
            }
            const course = {
                status : 'active',
                course : courseId,
                user_id : studentId,
                user_type : 'student',
            };
            const enrollment =  await UserRepository.enrollCourse(course);

            return res.status(200).json({
                status: `success`,
                message: `Course enrollment successful`,
                data: enrollment,
                // token
            })

        } catch (error) {
            return res.status(500).json(
                {
                  status: `error`,
                  message:  error.message,
              })
        }
    }

    async getEnrolledCourses(req, res){
        try {
            var studentId=new ObjectId(req.auth_id);
            const courses = await UserRepository.getStudentCourses(studentId);
            return res.status(200).json({
                status: `success`,
                message: "Student courses retrieved",
                data: courses
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }
    

    async getCourseClass(req, res){
        try {
            const courseId = new ObjectId(req.params.course_id);
            const studentId = new ObjectId(req.auth_id);
            if (!courseId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":course_id is required",
                })
            }
            const courses = await UserRepository.getStudentEnrolledCourse(studentId, courseId);
            if (courses == null) {
                return res.status(401).json({
                    status: `error`,
                    message: "Sorry you are not eligible to have this class. Kindly enroll.",
                })
            }
            return res.status(200).json({
                status: `success`,
                message: "Class retrieved successfully",
                data:courses
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }
    async getAllMessages(req, res){
        try {
            var studentId=new ObjectId(req.auth_id);
            const messages = await UserRepository.getStudentMessages(studentId);
            return res.status(200).json({
                status: `success`,
                message: "Messages retrieved.",
                data: messages
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async updateProfilePic(req, res){
        try {
            const userExists = await UserRepository.findStudentByID(req.auth_id);
            if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Account not found.",
                })
            }
            const s3Service = new S3Service();
            const uploadedPath = {};
            for (const fieldName in req.files) {
              const files = req.files[fieldName];
              const file = files[0];
              uploadedPath[fieldName] = await s3Service.uploadFile(fieldName, file);
            }
            const data = {
                photo: uploadedPath?.photo?.url ?? '',
            };
            const user = await UserRepository.updateStudentPhoto(new ObjectId(req.auth_id), data.photo);
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to update profile picture."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Profile picture updated successfully.",
                data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async updateEmail(req, res){
        try {
            const {email} = req.body;
           if (!email) {
            return res.status(401).json({
                status: `error`,
                message: "All fields are required",
            })
        }
        const userExists = await UserRepository.findStudentByID(req.auth_id);
        if (userExists.length == 0) {
            return res.status(401).json({
                status: `error`,
                message: "Account not found.",
            })
        }
            const user = await UserRepository.updateStudentEmail(new ObjectId(req.auth_id), email);
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to update email address."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Email updated successfully.",
                data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async updatePassword(req, res){
        try {
            const {password} = req.body;
            if (!password) {
          return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const userExists = await UserRepository.findStudentByID(req.auth_id);
        if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Account not found.",
                })
            }
            const user = await UserRepository.updateStudentPassword(new ObjectId(req.auth_id), hashedPassword);
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to password."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Password updated successfully.",
                data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }
}

module.exports = new StudentController();