import express from 'express'
import {addCourse, updateRoleToEducator, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData, editCourse, getCourseForEdit, pinTestimonial, unpinTestimonial} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator, protectAdmin } from '../middlewares/authMiddleware.js'
import { pinTestimonial as userPinTestimonial, unpinTestimonial as userUnpinTestimonial } from '../controllers/userController.js';
const educatorRouter = express.Router()

//add educator role (admin only)
educatorRouter.get('/update-role', protectAdmin, updateRoleToEducator)

//add course
educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)

//edit course routes
educatorRouter.get('/course/:courseId', protectEducator, getCourseForEdit)
educatorRouter.put('/course/:courseId', upload.single('image'), protectEducator, editCourse)

//get educator courses
educatorRouter.get('/courses',protectEducator,getEducatorCourses)

//get educator dashboard data
educatorRouter.get('/dashboard',protectEducator,educatorDashboardData)

//get enrolled students data
educatorRouter.get('/enrolled-students',protectEducator,getEnrolledStudentsData)

// Pin/unpin testimonial routes (admin only)
educatorRouter.post('/pin-testimonial', protectAdmin, userPinTestimonial);
educatorRouter.post('/unpin-testimonial', protectAdmin, userUnpinTestimonial);

export default educatorRouter