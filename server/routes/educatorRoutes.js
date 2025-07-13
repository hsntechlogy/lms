import express from 'express'
import {addCourse, updateRoleToEducator, promoteUserToEducator, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protectEducator, protectAdmin } from '../middlewares/authMiddleware.js'
const educatorRouter = express.Router()

//add educator role (admin only)
educatorRouter.get('/update-role', protectAdmin, updateRoleToEducator)

//admin function to promote user to educator
educatorRouter.post('/promote-user', protectAdmin, promoteUserToEducator)

educatorRouter.post('/add-course',upload.single('image'),protectEducator,addCourse)

educatorRouter.get('/courses',protectEducator,getEducatorCourses)

educatorRouter.get('/dashboard',protectEducator,educatorDashboardData)
educatorRouter.get('/enrolled-students',protectEducator,getEnrolledStudentsData)

export default educatorRouter;