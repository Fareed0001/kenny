
const bcrypt = require('bcryptjs');
const tokenGenerator = require('../utils/tokenGenerator');
const UserRepository = require('../repositories/UserRepository')
const Flutterwave = require('flutterwave-node-v3');
const S3Service = require('../services/s3Service');
const ObjectId = require('mongoose').Types.ObjectId;


class AgentsController {
    async create(req, res) {
        try {
            //const { firstname, lastname, email, password } = req.body;
            if (
                !req.body.firstname
                || !req.body.lastname
                || !req.body.email
                || !req.body.phone
                || !req.body.company
                || !req.body.password) {
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }

              //hash passwords
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const user = {...req.body, password: hashedPassword};
            const userExists = (await UserRepository.findAgentByEmail(user.email)) != null;
            if (userExists) {
                return res.status(401).json({
                    status: `error`,
                    message: "Agent already exists",
                })
            }
            const savedAgent =  await UserRepository.createAgent(user);
            const {password, ...newUser} = savedAgent._doc;
            const token =tokenGenerator.generateAgentToken(savedAgent);
            return res.json({
                status: `success`,
                message: `Agent created successfully.`,
                data: savedAgent,
                token
            })
        } catch (error) {
            return res.status(401).json(
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
            const user = await UserRepository.findAgentByEmail(req.body.email);
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
            const token = tokenGenerator.generateAgentToken(user);
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
            const user = await UserRepository.findAgentByID(new ObjectId(req.auth_id));
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
            const agentId = new ObjectId(req.auth_id);
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
            const isEnrolled = await UserRepository.getEnrollmentToCourse(agentId, courseId);
            if (isEnrolled.length > 0) {
                return res.json({
                    status: `error`,
                    message: "You have already enrolled this course",
                })
            }
            const course = {
                status : 'active',
                course : courseId,
                user_id : agentId,
                user_type : 'agent',
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
            const agentId = new ObjectId(req.auth_id);
            const courses = await UserRepository.getAgentCourses(agentId);
            return res.status(200).json({
                status: `success`,
                message: "Agent courses retrieved",
                data:courses
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
            const agentId = new ObjectId(req.auth_id);
            if (!courseId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":course_id is required",
                })
            }
            const courses = await UserRepository.getAgentEnrolledCourse(agentId, courseId);
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
            var agentId=new ObjectId(req.auth_id);
            const messages = await UserRepository.getAgentMessages(agentId);
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
            const userExists = await UserRepository.findAgentByID(req.auth_id);
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
            const user = await UserRepository.updateAgentPhoto(new ObjectId(req.auth_id), data.photo);
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
        const userExists = await UserRepository.findAgentByID(req.auth_id);
        if (userExists.length == 0) {
            return res.status(401).json({
                status: `error`,
                message: "Account not found.",
            })
        }
            const user = await UserRepository.updateAgentEmail(new ObjectId(req.auth_id), email);
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
            const userExists = await UserRepository.findAgentByID(req.auth_id);
        if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Account not found.",
                })
            }
            const user = await UserRepository.updateAgentPassword(new ObjectId(req.auth_id), hashedPassword);
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


    //Register student
    async registerStudent(req, res) {
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
            var user = {...req.body, password: hashedPassword };
                user['referred_by'] = new ObjectId(req.auth_id);
            const userExists = (await UserRepository.findStudentByEmail(user.email)) != null;
            if (userExists) {
                return res.status(500).json({
                    status: `error`,
                    message: "Student already exists",
                })
            }
            const savedDoctor =  await UserRepository.createStudent(user);
            const {password, ...newUser} = savedDoctor._doc;
          
            return res.json({
                status: `success`,
                message: `Student successfully registered.`,
                data: newUser,
            })
        } catch (error) {
            return res.status(500).json(
                {
                  status: `error`,
                  message:  error.message,
              })
        }
    }


    async getAgentStudents(req, res){
        try {
            var agentId=new ObjectId(req.auth_id);
            const messages = await UserRepository.getAgentStudents(agentId);
            return res.status(200).json({
                status: `success`,
                message: "Self registered students retrieved.",
                data: messages
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    //Enroll Student
    async enrollStudentToCourse(req, res) {
        try {
            //!Add validation
            var courseId = new ObjectId(req.query.cid);
            var userId = new ObjectId(req.query.sid);
            //Check User
            const userAccount = await UserRepository.findStudentByID(userId);
            if (userAccount?.length == 0){
                    return res.status(401).json({
                        status: `error`,
                        message: "Student not found",
                    })
                }
            //Check Course
            const courseData = await UserRepository.findCourseByID(courseId);
            if (courseData.length == 0) {
                    return res.status(401).json({
                        status: `error`,
                        message: "Course not found.",
            })
                }
            //Check enrollment
              const isEnrolled = await UserRepository.getEnrollmentToCourse(userId, courseId);
              if (isEnrolled.length>0) {
                  return res.status(401).json({
                      status: `error`,
                      message: "This student is already enrolled to this course.",
                  })
                }
            //Check Price
                if(courseData?.agent_price == 0){
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
                    message: "Student enrollment to course successful.",
                    data: courseData,
                    });
                } else {
                    var expectedAmount = (req.query.amt);
                    var transactionId = (req.query.tuid);
                    const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY_LIVE, process.env.FLW_SECRET_KEY_LIVE);
                    await flw.Transaction.verify({ id: transactionId })
                        .then(async (response) => {
                            if (
                                response.data.status === "successful"
                                && response.data.amount.toString() === expectedAmount.toString()
                                //&& response.data.currency === expectedCurrency
                                ) {
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
                                    message: "Student enrollment to course successful",
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
                }
        } catch (error) {
            return res.status(401).json(
                {
                  status: `error`,
                  message:  "Unable to verify payment - contact system administrator",
                  debugger: error.message
              })
        }
    }
}

module.exports = new AgentsController();