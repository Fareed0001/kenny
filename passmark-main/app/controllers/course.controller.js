const Course = require('../models/course.model');
const Flutterwave = require('flutterwave-node-v3');
const UserRepository = require('../repositories/UserRepository');
const ObjectId = require('mongoose').Types.ObjectId;

class CourseController {

    async allCources(req, res) {
        try {
            const courses =  await Course.find();
            return res.status(200).json({
                status: `success`,
                message: "Courses retrieved",
                data: courses,
            });
        } catch (error) {
            return res.status(500).json(
                {
                  status: `error`,
                  message:  error.message,
              })
        }
    }


    async verifyPayment(req, res) {
        try {
            var courseId = new ObjectId(req.query.cid);
            var transactionId = (req.query.tuid);
            var expectedAmount = (req.query.amt);
            var userId = new ObjectId(req.auth_id);
            var userType = (req.auth_role);
            const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY_LIVE, process.env.FLW_SECRET_KEY_LIVE);
            await flw.Transaction.verify({ id: transactionId })
                .then(async (response) => {
                    
                     if (
                        response.data.status === "successful"
                        && response.data.amount.toString() === expectedAmount.toString()
                        //&& response.data.currency === expectedCurrency
                        ) {
                           //Check User
                            var userAccount;
                             if(userType == 'student'){
                                 var userAccount = await UserRepository.findStudentByID(userId);
                                 if (userAccount?.length == 0) {
                                    return res.status(401).json({
                                        status: `error`,
                                        message: "Student not found",
                                    })
                                }
                             }
                             if(userType == 'agent'){
                              userAccount = await UserRepository.findAgentByID(userId);
                                if (userAccount?.length == 0) {
                                    return res.status(401).json({
                                        status: `error`,
                                        message: "Agent not found",
                                    })
                                }
                            }
                        if(userAccount == null){
                            return res.status(401).json({
                                status: `error`,
                                message: "User account not found",
                            });
                            }

                         //Check Course
                         const courseData = await UserRepository.findCourseByID(courseId);
                            if (courseData.length == 0) {
                                    return res.status(401).json({
                                        status: `error`,
                                        message: "Course not found.",
                                    })
                                }
                            //Get user
                            //Check enrollment
                            const isEnrolled = await UserRepository.getEnrollmentToCourse(userId, courseId);
                            if (isEnrolled.length>0) {
                                return res.status(401).json({
                                    status: `error`,
                                    message: "You have already enrolled this course",
                                })
                            }
                            //Enroll User
                            const enrollData = {
                                status : 'active',
                                course : courseData.id,
                                user_id : userAccount._id,
                                user_type : userAccount.role,
                            };
                            const enrollment =  await UserRepository.enrollCourse(enrollData);
                        return res.status(200).json({
                            status: `success`,
                            message: "Enrollment successful",
                            data: courseData,
                        });
                    } else {
                        // Inform the customer their payment was unsuccessful
                        return res.status(401).json({
                            status: `failed`,
                            message: "Unable to verify payment",
                        });
                    }
                });
        } catch (error) {
            return res.status(500).json(
                {
                  status: `error`,
                  message:  "Unable to verify payment - contact system administrator" ?? error.message,
              })
        }
    }

}

module.exports = new CourseController();