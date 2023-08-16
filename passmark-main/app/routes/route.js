const express = require('express');
const AdminController = require('../controllers/admin.controller');
const AgentController = require('../controllers/agent.controller');
const StudentController = require('../controllers/student.controller');
const CourseController = require('../controllers/course.controller');
const authMiddlewares = require('../middlewares/authMiddlewares');
const  fileUpload = require('../middlewares/uploadMiddleware');

const InstructorController = require('../controllers/instructor.controller');
//

const middlewares = {
    admin : authMiddlewares.adminMiddleware,
    agent : authMiddlewares.agentMiddleware,
    student : authMiddlewares.studentMiddleware,
    instructor : authMiddlewares.instructorMiddleware,
    upload : fileUpload
}

const router = express.Router();
router.get('/', (req, res) => {
    return res.json({
        message: "Api version 1.0 up and running.. Cheers!!!",
        credits: "@TechAncestor",
        last_updated:"July 2023"
    });
});

//ADMIN
router.post('/admin/login', AdminController.login);
router.post('/admin/create', [middlewares.admin], AdminController.create);
router.get('/admin/userdata', [middlewares.admin], AdminController.getProfile);
router.post('/admin/course/:course_id/enroll/:student_id', [middlewares.admin], AdminController.enrollStudentToCourse);
router.post('/admin/create/course', [middlewares.admin, middlewares.upload.fields([
    { name: 'cover_image', maxCount: 1 },
  ])], AdminController.createCourse);
  router.post('/admin/course/class/add', [middlewares.admin, middlewares.upload.fields([
    { name: 'video', maxCount: 1 }, { name: 'resource', maxCount: 1 },
  ])], AdminController.addClassToCourse);
  router.post('/admin/message/normal/add', [middlewares.admin], AdminController.addNormalBroadcastMessage);
  router.post('/admin/message/meeting/add', [middlewares.admin], AdminController.addMeetingClassNotification);

  router.post('/admin/create/instructor', [middlewares.admin, middlewares.upload.fields([
    { name: 'photo', maxCount: 1 },
  ])], AdminController.createInstructor);
  router.get('/admin/students', [middlewares.admin], AdminController.getStudents);
  router.get('/admin/courses', [middlewares.admin], AdminController.getCourses);
  router.get('/admin/instructors', [middlewares.admin], AdminController.getInstructors);
  router.get('/admin/agents', [middlewares.admin], AdminController.getAgents);
  router.post('/admin/agents/:agent_id/approve', [middlewares.admin], AdminController.approveAgent);
  router.post('/admin/agents/:agent_id/reject', [middlewares.admin], AdminController.rejectAgent);
  router.delete('/admin/students/:student_id/delete', [middlewares.admin], AdminController.deleteStudent);
  router.delete('/admin/agents/:agent_id/delete', [middlewares.admin], AdminController.deleteAgent);
  router.delete('/admin/instructors/:instructor_id/delete', [middlewares.admin], AdminController.deleteInstructor);
  router.delete('/admin/courses/:course_id/delete', [middlewares.admin], AdminController.deleteCourse);
  //router.delete('/admin/enrollments/:enrollment_id/delete', [middlewares.admin], AdminController.deleteEnrollment);



//Agents
router.post('/agent/register', AgentController.create);
router.post('/agent/login', AgentController.login);
router.get('/agent/userdata',[middlewares.agent], AgentController.getProfile);
router.get('/agent/mycourses',[middlewares.agent], AgentController.getEnrolledCourses);
router.get('/agent/mycourse/:course_id', [middlewares.agent], AgentController.getCourseClass);
router.post('/agent/course/:course_id',[middlewares.agent], AgentController.enrollToCourse);
router.post('/agent/update/picture',[middlewares.agent, middlewares.upload.fields([
  { name: 'photo', maxCount: 1 },
])], AgentController.updateProfilePic);
router.post('/agent/update/email',[middlewares.agent], AgentController.updateEmail);
router.post('/agent/update/password',[middlewares.agent], AgentController.updatePassword);
router.get('/agent/payment-verify', [middlewares.agent], CourseController.verifyPayment);
router.get('/agent/messages', [middlewares.agent], AgentController.getAllMessages);
router.get('/agent/students', [middlewares.agent], AgentController.getAgentStudents);
router.post('/agent/student/register', [middlewares.agent], AgentController.registerStudent);
router.post('/agent/student/enroll', [middlewares.agent], AgentController.enrollStudentToCourse);


//STUDENTS
router.post('/student/register', StudentController.create);
router.post('/student/login', StudentController.login);
router.get('/student/userdata',[middlewares.student], StudentController.getProfile);
router.get('/student/mycourses',[middlewares.student], StudentController.getEnrolledCourses);
router.get('/student/mycourse/:course_id', [middlewares.student], StudentController.getCourseClass);
router.get('/student/mycourse/:course_id', [middlewares.student], StudentController.getCourseClass);
router.post('/student/course/:course_id',[middlewares.student], StudentController.enrollToCourse);
router.post('/student/update/picture',[middlewares.student, middlewares.upload.fields([
  { name: 'photo', maxCount: 1 },
])], StudentController.updateProfilePic);
router.post('/student/update/email',[middlewares.student], StudentController.updateEmail);
router.post('/student/update/password',[middlewares.student], StudentController.updatePassword);
router.get('/student/payment-verify', [middlewares.student], CourseController.verifyPayment);
router.get('/student/messages', [middlewares.student], StudentController.getAllMessages);

//delete acctx
//zoomS

//INSTRUCTOR
router.post('/instructor/login', InstructorController.login);
router.get('/instructor/userdata',[middlewares.instructor], InstructorController.getProfile);
router.post('/instructor/update/picture',[middlewares.instructor, middlewares.upload.fields([
  { name: 'photo', maxCount: 1 },
])], InstructorController.updateProfilePic);
router.post('/instructor/update/email',[middlewares.instructor], InstructorController.updateEmail);
router.post('/instructor/update/password',[middlewares.instructor], InstructorController.updatePassword);
router.get('/instructor/mycourses',[middlewares.instructor], InstructorController.getTutoringCourses);
// router.get('/instructor/mycourse/:course_id', [middlewares.student], InstructorController.getCourseClass);
// router.get('/instructor/mycourse/:course_id', [middlewares.student], InstructorController.getCourseClass);
// router.post('/instructor/course/:course_id',[middlewares.student], InstructorController.enrollToCourse);

// router.get('/instructor/payment-verify', [middlewares.student], CourseController.verifyPayment);
// router.get('/instructor/messages', [middlewares.student], InstructorController.getAllMessages);


//COURSES
router.get('/courses', CourseController.allCources);


// Install with:



module.exports = router;