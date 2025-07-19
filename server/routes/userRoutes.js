import express from 'express'
import {addUserRating, getUserCourseProgress, getUserData,updateUserCourseProgress,userEnrolledCourses,addTestimonial,getCourseTestimonials,manualPayment} from '../controllers/userController.js'
import upload from '../configs/multer.js'


const userRouter =express.Router()

userRouter.get('/data',getUserData)
userRouter.get('/enrolled-courses',userEnrolledCourses)

userRouter.post('/update-course-progress',updateUserCourseProgress)

userRouter.post('/get-course-progress',getUserCourseProgress)
userRouter.post('/add-rating',addUserRating)
userRouter.post('/add-testimonial',addTestimonial)
userRouter.get('/testimonials/:courseId',getCourseTestimonials)
userRouter.post('/manual-payment',upload.single('paymentScreenshot'),manualPayment)

export default userRouter