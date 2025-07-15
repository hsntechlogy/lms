//update role for educator
import { clerkClient } from '@clerk/clerk-sdk-node';
import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/Users.js'
import connectCloudinary from '../configs/cloudinary.js'

// Initialize Cloudinary
connectCloudinary();

export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth.userId

        // Check if the current user is an admin
        const currentUser = await clerkClient.users.getUser(userId);
        if (currentUser.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Only admins can promote users to educators' })
        }

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        })
        res.json({ success: true, message: 'you can publish a course now' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//addcourse
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not Attached' })
        }

        // Ensure the educator exists in the User collection
        let educatorUser = await User.findById(educatorId);
        if (!educatorUser) {
            // Get educator info from Clerk
            const clerkUser = await clerkClient.users.getUser(educatorId);
            if (!clerkUser) {
                return res.json({ success: false, message: 'Educator not found' })
            }
            
            // Create User document if it doesn't exist
            educatorUser = await User.create({
                _id: educatorId,
                name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown',
                email: clerkUser.emailAddresses[0]?.emailAddress || 'No email',
                imageUrl: clerkUser.imageUrl
            });
        }

        const parsedCourseData = await JSON.parse(courseData)
        parsedCourseData.educator = educatorId
        parsedCourseData.isPublished = true // Set to true by default
        
        const newCourse = await Course.create(parsedCourseData)
        
        try {
            // Check if Cloudinary is properly configured
            if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY || !process.env.CLOUDINARY_NAME) {
                throw new Error('Cloudinary not configured');
            }

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'course-thumbnails',
                resource_type: 'image',
                transformation: [
                    { width: 400, height: 300, crop: 'fill' }
                ]
            })
            newCourse.courseThumbnail = imageUpload.secure_url
            await newCourse.save()
            res.json({ success: true, message: 'course Added' })
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            // If Cloudinary fails, use a more reliable placeholder image
            newCourse.courseThumbnail = 'https://picsum.photos/400/300?random=' + Date.now()
            await newCourse.save()
            res.json({ success: true, message: 'course Added (thumbnail upload failed, using placeholder)' })
        }
    } catch (error) {
        console.error('Error adding course:', error);
        res.json({ success: false, message: error.message })
    }
}

//edit course
export const editCourse = async (req, res) => {
    try {
        const { courseId } = req.params
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.auth.userId

        // Check if course exists and belongs to educator
        const existingCourse = await Course.findById(courseId)
        if (!existingCourse) {
            return res.json({ success: false, message: 'Course not found' })
        }

        if (existingCourse.educator !== educatorId) {
            return res.json({ success: false, message: 'You can only edit your own courses' })
        }

        const parsedCourseData = await JSON.parse(courseData)
        
        // Update course data
        Object.assign(existingCourse, parsedCourseData)
        
        // Handle thumbnail upload if new image is provided
        if (imageFile) {
            try {
                // Check if Cloudinary is properly configured
                if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY || !process.env.CLOUDINARY_NAME) {
                    throw new Error('Cloudinary not configured');
                }

                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    folder: 'course-thumbnails',
                    resource_type: 'image',
                    transformation: [
                        { width: 400, height: 300, crop: 'fill' }
                    ]
                })
                existingCourse.courseThumbnail = imageUpload.secure_url
            } catch (cloudinaryError) {
                console.error('Cloudinary upload error:', cloudinaryError);
                // Keep existing thumbnail if upload fails
                console.log('Keeping existing thumbnail due to Cloudinary error');
            }
        }

        await existingCourse.save()
        res.json({ success: true, message: 'Course updated successfully' })
    } catch (error) {
        console.error('Error editing course:', error);
        res.json({ success: false, message: error.message })
    }
}

//get course by id for editing
export const getCourseForEdit = async (req, res) => {
    try {
        const { courseId } = req.params;
        const educatorId = req.auth.userId;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        if (course.educator !== educatorId) {
            return res.json({ success: false, message: 'You can only view your own courses' });
        }

        res.json({ success: true, courseData: course });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

//get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//get educator dashboard data
export const educatorDashboardData = async (req, res) => {
    try {
        const educatorId = req.auth.userId
        const courses = await Course.find({ educator: educatorId })
        const totalStudents = courses.reduce((acc, course) => acc + course.enrolledStudents.length, 0)
        const totalRevenue = courses.reduce((acc, course) => {
            const courseRevenue = course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100)
            return acc + courseRevenue
        }, 0)

        res.json({
            success: true,
            data: {
                totalCourses: courses.length,
                totalStudents,
                totalRevenue: totalRevenue.toFixed(2)
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

//get enrolled students data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educatorId = req.auth.userId
        const courses = await Course.find({ educator: educatorId }).populate('enrolledStudents')
        
        const studentsData = courses.map(course => ({
            courseId: course._id,
            courseTitle: course.courseTitle,
            students: course.enrolledStudents
        }))

        res.json({ success: true, studentsData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}