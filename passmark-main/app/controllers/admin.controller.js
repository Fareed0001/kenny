const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcryptjs');
const tokenGenerator = require('../utils/tokenGenerator');
const UserRepository = require('../repositories/UserRepository')
const S3Service = require('../services/s3Service');
const Sendchamp = require('sendchamp-sdk');

class AdminController {

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
            const userExists = (await UserRepository.findAdminByEmail(user.email)) != null;
            if (userExists) {
                return res.status(401).json({
                    status: `error`,
                    message: "Admin already exists",
                })
            }
            const savedDoctor =  await UserRepository.createAdmin(user);
            const {password, ...newUser} = savedDoctor._doc;
            const token = tokenGenerator.generateAdminToken(newUser);
            return res.json({
                status: `success`,
                message: `Admin created`,
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
             //const { email, password } = req.body;
            if (!req.body.email || !req.body.password) {
                return res.status(401).json(
                    { 
                        status: `error`,
                        message: "All fields are required",
                        //debug: req.body
                     }
                    )
            }
            const user = await UserRepository.findAdminByEmail(req.body.email);
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
            const token = tokenGenerator.generateAdminToken(user);
            const {password, ...userData} = user._doc;
            return res.status(200).json({
                data:userData,
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
            const user = await UserRepository.findAdminByID(new ObjectId(req.auth_id));
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

    async createCourse(req, res) {
        try {
            if (!req.body.title ||
                !req.body.description || 
                !req.body.student_price || 
                !req.body.agent_price|| 
                !req.body.duration
               // !req.body.instructor
                ) {
                  //  return req.body;
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }
            const courseExists = (await UserRepository.findCourseByTitle(req.body.title)) != null;
            if (courseExists) {
                return res.status(401).json({
                    status: `error`,
                    message: "A Course with this title already exist.",
                })
            }

            if(req.body.instructor){
                const instructorExists = (await UserRepository.findInstructorByID(new ObjectId(req.body.instructor))) == null;
                if (instructorExists) {
                    return res.status(401).json({
                        status: `error`,
                        message: "Instructor not found.",
                    })
                }
            }

              const s3Service = new S3Service();
              const uploadedPath = {};
              // Loop through the files in the request
              for (const fieldName in req.files) {
                const files = req.files[fieldName];
                const file = files[0];
                uploadedPath[fieldName] = await s3Service.uploadFile(fieldName, file);
              }
                const course = {
                  title: req.body.title,
                  description: req.body.description,
                  agent_price: req.body.agent_price,
                  student_price: req.body.student_price,
                  duration: req.body.duration,
                  instructor: req.body.instructor??'',
                  cover_image: uploadedPath?.cover_image?.url ?? '',
                };
                const newCourse =  await UserRepository.createCourse(course);
                return res.status(200).json({
                    status: `success`,
                    message: `Course created`,
                    data: newCourse,
            })
        } catch (error) {
          res.status(401).json({ 
             status: `error`, 
             error: 'Failed to upload files and save data', 
             message: error.message
            });
        }
    }

    async enrollStudentToCourse(req, res) {
        try {
            const courseId = new ObjectId(req.params.course_id);
            const studentId = new ObjectId(req.params.student_id);
            if (!courseId || !studentId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":course_id and :student_id is required",
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
            const userNotExists = (await UserRepository.findStudentByID(req.body.tutor)) == null;
            if (userNotExists) {
                return res.json({
                    status: `error`,
                    message: "Student not found",
                })
            }
            const course = {
                status : 'active',
                course : courseId,
                student : studentId,
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

    async addClassToCourse(req, res) {
        try {
            if (!req.body.title ||
                !req.body.instructor ||
                !req.body.description ||
                !req.body.course_id
                ) {
                  //  return req.body;
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }
            const courseExists = (await UserRepository.findCourseByID(req.body.course_id)) == null;
            if (courseExists) {
                return res.status(401).json({
                    status: `error`,
                    message: "Course does not exist exist.",
                })
              }
              const s3Service = new S3Service();
              const uploadedPath = {};
              // Loop through the files in the request
              for (const fieldName in req.files) {
                const files = req.files[fieldName];
                const file = files[0];
                uploadedPath[fieldName] = await s3Service.uploadFile(fieldName, file);
              }
                const course = {
                  title: req.body.title,
                  description: req.body.description,
                  instructor: req.body.instructor,
                  course: req.body.course_id,
                  video: uploadedPath?.video?.url ?? '',
                  resource: uploadedPath?.resource?.url ?? '',
                //   class_type:'normal',
                //   date: '',
                //   time: '',
                };
                const newClass =  await UserRepository.createClass(course);
                return res.status(200).json({
                    status: `success`,
                    message: `Normal Class created`,
                    data: newClass,
            })
        } catch (error) {
          res.status(401).json({ 
             status: `error`, 
             error: 'Failed to upload files and save data', 
             message: error.message
            });
        }
    }

    async addNormalBroadcastMessage(req, res) {
        try {
            if (!req.body.title ||
                !req.body.instructor ||
                !req.body.description ||
                !req.body.course_id ||
                !req.body.date ||
                !req.body.time
                ) {
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }
            const courseExists = (await UserRepository.findCourseByID(req.body.course_id)) == null;
            if (courseExists) {
                return res.status(401).json({
                    status: `error`,
                    message: "Course does not exist exist.",
                })
              }

                var notification = {
                  title: req.body.title,
                  description: req.body.description,
                  instructor: req.body.instructor,
                  course: req.body.course_id,
                  messsage_type:'normal',
                  date: req.body.date,
                  time: req.body.time,
                  link: '',
                  password: '',
                };
                const newNotification =  await UserRepository.createBroadcastMessage(notification);
                return res.status(200).json({
                    status: `success`,
                    message: `Normal class broadcast sent.`,
                    data: newNotification,
            })
        } catch (error) {
          res.status(401).json({ 
             status: `error`, 
             error: 'Failed to upload files and save data', 
             message: error.message
            });
        }
    }

    async addMeetingClassNotification(req, res) {
        try {
            if (!req.body.title ||
                !req.body.link ||
                !req.body.course_id
                ) {
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required",
                })
            }
            const courseExists = (await UserRepository.findCourseByID(req.body.course_id)) == null;
            if (courseExists) {
                return res.status(401).json({
                    status: `error`,
                    message: "Course does not exist exist.",
                })
              }

                const notification = {
                  title: req.body.title,
                  link: req.body.link,
                  password: req.body.password,
                  course: req.body.course_id,
                  messsage_type: 'meeting',
                  date: req.body.date,
                  time: req.body.time,
                  description: '',
                  instructor: '',
                };
                const newNotification =  await UserRepository.createBroadcastMessage(notification);
                return res.status(200).json({
                    status: `success`,
                    message: `Zoom class broadcast sent.`,
                    data: newNotification,
            })
        } catch (error) {
          res.status(401).json({ 
             status: `error`, 
             error: 'Failed to upload files and save data', 
             message: error.message
            });
        }
    }

    async createInstructor(req, res) {
        try {
            if(!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password){
                return res.status(401).json({
                    status: `error`,
                    message: "All fields are required.",
                })
            }
              const s3Service = new S3Service();
              const uploadedPath = {};
              for (const fieldName in req.files) {
                const files = req.files[fieldName];
                const file = files[0];
                uploadedPath[fieldName] = await s3Service.uploadFile(fieldName, file);
              }

                 //hash passwords
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
                const course = {
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  email: req.body.email,
                  password: hashedPassword,
                  photo: uploadedPath?.photo?.url ?? '',
                };
                const newInstructor =  await UserRepository.createInstructor(course);
                return res.status(200).json({
                    status: `success`,
                    message: `Instructor created successfully`,
                    data: newInstructor,
            })
        } catch (error) {
          res.status(401).json({ 
             status: `error`, 
             error: 'Failed to upload files and save data', 
             message: error.message
            });
        }
    }

    async getCourses(req, res){
        try {
            const courses = await UserRepository.getAllCourses();
            return res.status(200).json({
                status: `success`,
                message: "Courses retrieved",
                data:courses
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async getInstructors(req, res){
        try {
            const instructors = await UserRepository.getAllInstructors();
            return res.status(200).json({
                status: `success`,
                message: "Instructors retrieved",
                data:instructors
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async getStudents(req, res){
        try {
            const students = await UserRepository.getAllStudents();
            return res.status(200).json({
                status: `success`,
                message: "Students retrieved",
                data:students
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async getAgents(req, res){
        try {
            const agents = await UserRepository.getAllAgents();
            return res.status(200).json({
                status: `success`,
                message: "Agents retrieved",
                data:agents
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }
 
    //agent verification
    async approveAgent(req, res){
        try {
            const agentId = new ObjectId(req.params.agent_id);
            if (!agentId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":agent_id is required",
                })
            }
            const userExists = await UserRepository.findAgentByID(agentId);
        if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Account not found.",
                })
            }
            const user = await UserRepository.approveAgentAccount(new ObjectId(agentId));
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to password."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Agent account approved.",
                data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }
    
    async rejectAgent(req, res){
        try {
            const agentId = new ObjectId(req.params.agent_id);
            if (!agentId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":agent_id is required",
                })
            }
            const userExists = await UserRepository.findAgentByID(agentId);
        if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Account not found.",
                })
            }
            const user = await UserRepository.rejectAgentAccount(new ObjectId(agentId));
            if (!user){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to password."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Agent account rejected.",
                // data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    //Deletion
    async deleteCourse(req, res){
        try {
            const courseId = new ObjectId(req.params.course_id);
            if (!courseId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":course_id is required",
                })
            }
            const courseExists = await UserRepository.findCourseByID(courseId);
        if (courseExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Course not found.",
                })
            }
            const course = await UserRepository.deleteCourse(new ObjectId(courseId));
            if (!course){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to delete course."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Course deleted successfully.",
                // data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async deleteAgent(req, res){
        try {
            const agentId = new ObjectId(req.params.agent_id);
            if (!agentId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":agent_id is required",
                })
            }
            const agentExists = await UserRepository.findAgentByID(agentId);
        if (agentExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Agent not found.",
                })
            }
            const agent = await UserRepository.deleteAgent(new ObjectId(agentId));
            if (!agent){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to delete agent."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Agent deleted successfully.",
                // data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async deleteStudent(req, res){
        try {
            const studentId = new ObjectId(req.params.student_id);
            if (!studentId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":student_id is required",
                })
            }
            const studentExists = await UserRepository.findStudentByID(studentId);
        if (studentExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Student not found.",
                })
            }
            const student = await UserRepository.deleteStudent(new ObjectId(studentId));
            if (!student){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to delete student."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Student deleted successfully.",
                // data: user
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async deleteInstructor(req, res){
        try {
            const instructorId = new ObjectId(req.params.instructor_id);
            if (!instructorId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":instructor_id is required",
                })
            }
            const userExists = await UserRepository.findInstructorByID(instructorId);
        if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Student not found.",
                })
            }
            const agent = await UserRepository.deleteInstructor(new ObjectId(instructorId));
            if (!agent){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to delete instructor."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Instructor deleted successfully.",
           
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    async deleteEnrollment(req, res){
        try {
            const enrollmentId = new ObjectId(req.params.enrollment_id);
            if (!enrollmentId) {
                return res.status(401).json({
                    status: `error`,
                    message: ":instructor_id is required",
                })
            }
            const userExists = await UserRepository.findEnrollmentByID(enrollmentId);
        if (userExists.length == 0) {
                return res.status(401).json({
                    status: `error`,
                    message: "Enrollment not found.",
                })
            }
            const agent = await UserRepository.deleteEnrollment(new ObjectId(enrollmentId));
            if (!agent){
                return res.status(401).json(
                    {
                      status: `error`,
                      message: "Failed to delete enrollment."
                     });
            }
            return res.status(200).json({
                status: `success`,
                message: "Enrollment deleted successfully.",
           
            });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }

    //Deletion
    async sendSMS(req, res){
        try {
            const sendchamp = new Sendchamp({
                mode: 'test', 
                publicKey: 'sendchamp_test_$2y$10$U2SHG5T2F/cr0jfzNCKgguHv.23plvJP/75EzZjF5MtLXz65SDrQi'
              });

              const sms = sendchamp.SMS;
              const options = {
                to: ['2347030976216'],
                message: 'Hello from PassGrades',
                sender_name: 'PassGrades',
                route: 'international'
              };
              
            await sms.send(options)
                .then(response => {
                  console.log(response);
                })
                .catch(error => {
                  console.log(error);
                });
        } catch (err){
            return res.status(401).json({
                error: 'error',
                message: err.message
            })
        }
    }
}

module.exports = new AdminController();