import express from 'express'
import {addCourse, updateRoleToEducator, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData, editCourse, getCourseForEdit, deleteTestimonial} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator, protectAdmin } from '../middlewares/authMiddleware.js'

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

// Delete testimonial (educator only)
educatorRouter.post('/delete-testimonial', protectEducator, deleteTestimonial)

export default educatorRouter