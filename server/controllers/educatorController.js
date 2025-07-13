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

// Admin function to promote a student to educator
export const promoteUserToEducator = async (req, res) => {
    try {
        const adminId = req.auth.userId
        const { targetUserId } = req.body

        if (!targetUserId) {
            return res.json({ success: false, message: 'Target user ID is required' })
        }

        // Check if the current user is an admin
        const currentUser = await clerkClient.users.getUser(adminId);
        if (currentUser.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Only admins can promote users to educators' })
        }

        // Get the target user
        const targetUser = await clerkClient.users.getUser(targetUserId);
        if (!targetUser) {
            return res.json({ success: false, message: 'Target user not found' })
        }

        // Check if target user is a student
        if (targetUser.publicMetadata.role !== 'student') {
            return res.json({ success: false, message: 'Only students can be promoted to educators' })
        }

        // Promote the user to educator
        await clerkClient.users.updateUserMetadata(targetUserId, {
            publicMetadata: {
                role: 'educator',
            }
        })

        res.json({ success: true, message: 'User promoted to educator successfully' })
    } catch (error) {
        console.error('Error promoting user:', error);
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

        // Check if Cloudinary is properly configured
        if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY || !process.env.CLOUDINARY_NAME) {
            return res.json({ success: false, message: 'Cloudinary configuration missing. Please check your environment variables.' })
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
            const imageUpload = await cloudinary.uploader.upload(imageFile.path)
            newCourse.courseThumbnail = imageUpload.secure_url
            await newCourse.save()
            res.json({ success: true, message: 'course Added' })
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            // If Cloudinary fails, still save the course but with a placeholder image
            newCourse.courseThumbnail = 'https://via.placeholder.com/400x300?text=Course+Thumbnail'
            await newCourse.save()
            res.json({ success: true, message: 'course Added (thumbnail upload failed, using placeholder)' })
        }
    } catch (error) {
        console.error('Error adding course:', error);
        res.json({ success: false, message: error.message })
    }
}

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

//get educator dashboard data(total earning,enrolled students,no of course)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator })
        const totalCourses = courses.length

        const courseIds = courses.map(course => course._id)

        // calculate total earnings from purchase 
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        })

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

        // collect unique enrolled student IDS with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl')

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                })
            })
        }

        res.json({
            success: true, dashboardData: {
                totalEarnings, enrolledStudentsData, totalCourses
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// get intro student data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId
        const courses = await Course.find({ educator })
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseData: purchase.createdAt
        }))

        res.json({ success: true, enrolledStudents })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}