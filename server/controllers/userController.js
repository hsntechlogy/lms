import User from "../models/Users.js"
import { Purchase } from "../models/Purchase.js";
import Course from "../models/course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import multer from "multer";
import { createCourseCompletionNotification, createPaymentSuccessNotification } from './notificationController.js';

// List of negative words to filter out
const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'useless', 'waste', 'disappointing',
    'poor', 'mediocre', 'boring', 'confusing', 'difficult', 'hard', 'complicated',
    'expensive', 'overpriced', 'cheap', 'low quality', 'amateur', 'unprofessional',
    'outdated', 'old', 'broken', 'glitch', 'bug', 'error', 'crash', 'slow',
    'annoying', 'frustrating', 'irritating', 'stupid', 'dumb', 'idiot', 'moron',
    'hate', 'dislike', 'disgusting', 'nasty', 'gross', 'ugly', 'hideous'
];

// Function to check for negative words
const containsNegativeWords = (text) => {
    const lowerText = (text || '').toLowerCase();
    return negativeWords.some(word => lowerText.includes(word));
};

// Function to check if text contains only English characters
const isEnglishOnly = (text) => {
    const englishRegex = /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|<>\/\n\r]*$/;
    return englishRegex.test(text);
};

export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        let user = await User.findById(userId);

        if (!user) {
            // Create user if doesn't exist
            user = await User.create({
                _id: userId,
                name: 'Unknown User',
                email: 'unknown@example.com'
            });
        }

        res.json({ success: true, user: user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const courses = await Course.find({ enrolledStudents: userId }).populate('educator');
        res.json({ success: true, enrolledCourses: courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateUserCourseProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body;
        const userId = req.auth.userId;

        // Validate courseId
        if (!courseId || courseId === 'undefined') {
            return res.json({ success: false, message: 'Invalid course ID' });
        }
        // Add check and logging for userId
        if (!userId) {
            console.error('Missing userId in updateUserCourseProgress', { courseId, lectureId });
            return res.status(400).json({ success: false, message: 'User ID is required.' });
        }
        let progress = await CourseProgress.findOne({ userId, courseId });
        
        if (!progress) {
            progress = new CourseProgress({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            });
        } else {
            if (!progress.lectureCompleted.includes(lectureId)) {
                progress.lectureCompleted.push(lectureId);
            }
        }

        await progress.save();
        
        // Check if course is completed and create notification
        const course = await Course.findById(courseId);
        if (course) {
            const totalLectures = course.courseContent.reduce((total, chapter) => 
                total + chapter.chapterContent.length, 0
            );
            
            if (progress.lectureCompleted.length >= totalLectures) {
                // Course completed - create notification
                try {
                    await createCourseCompletionNotification(userId, courseId);
                } catch (error) {
                    console.error('Error creating course completion notification:', error);
                }
            }
        }
        
        res.json({ success: true, message: 'Progress updated' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getUserCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.auth.userId;

        // Validate courseId
        if (!courseId || courseId === 'undefined') {
            return res.json({ 
                success: true, 
                progressData: { 
                    userId, 
                    courseId: null, 
                    lectureCompleted: [] 
                } 
            });
        }
        // Add check and logging for userId
        if (!userId) {
            console.error('Missing userId in getUserCourseProgress', { courseId });
            return res.status(400).json({ success: false, message: 'User ID is required.' });
        }
        const progress = await CourseProgress.findOne({ userId, courseId });
        
        if (!progress) {
            return res.json({ 
                success: true, 
                progressData: { 
                    userId, 
                    courseId, 
                    lectureCompleted: [] 
                } 
            });
        }

        res.json({ success: true, progressData: progress });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const addUserRating = async (req, res) => {
    try {
        const { courseId, rating } = req.body;
        const userId = req.auth.userId;

        // Validate courseId
        if (!courseId || courseId === 'undefined') {
            return res.json({ success: false, message: 'Invalid course ID' });
        }

        // Only allow 5-star ratings
        if (rating !== 5) {
            return res.json({ success: false, message: 'Only 5-star ratings are allowed.' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        // Check if user is enrolled
        if (!course.enrolledStudents.includes(userId)) {
            return res.json({ success: false, message: 'You must be enrolled to rate this course' });
        }

        // Check if user has already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);
        
        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }

        await course.save();
        res.json({ success: true, message: 'Rating added successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const addTestimonial = async (req, res) => {
    try {
        const { courseId, comment } = req.body;
        const userId = req.auth.userId;

        // Validate courseId
        if (!courseId || courseId === 'undefined') {
            return res.json({ success: false, message: 'Invalid course ID' });
        }

        // Validate comment
        if (!comment || comment.trim().length < 10) {
            return res.json({ success: false, message: 'Comment must be at least 10 characters long' });
        }

        if (comment.length > 500) {
            return res.json({ success: false, message: 'Comment must be less than 500 characters' });
        }

        // Appreciation words list
        const appreciationWords = ['good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful', 'outstanding', 'superb', 'love', 'helpful', 'useful', 'best', 'brilliant', 'impressive', 'positive', 'enjoyed', 'liked', 'appreciate'];
        const lowerComment = comment.toLowerCase();
        const hasAppreciation = appreciationWords.some(word => lowerComment.includes(word));
        if (!hasAppreciation) {
            return res.json({ success: false, message: 'Your comment must include an appreciation word (e.g., good, excellent, etc.).' });
        }

        // Check if comment is in English only
        if (!isEnglishOnly(comment)) {
            return res.json({ success: false, message: 'Please write your comment in English only' });
        }

        // Check for negative words
        if (containsNegativeWords(comment)) {
            return res.json({ success: false, message: 'Please keep your comment positive and constructive' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        // Check if user is enrolled
        if (!course.enrolledStudents.includes(userId)) {
            return res.json({ success: false, message: 'You must be enrolled to add a testimonial' });
        }

        // Check if user has rated the course 5 stars
        const userRating = course.courseRatings.find(r => r.userId === userId);
        if (!userRating || userRating.rating !== 5) {
            return res.json({ success: false, message: 'You must rate the course 5 stars to add a testimonial' });
        }

        // Only allow up to 3 testimonials per user per course
        const userTestimonials = course.testimonials.filter(t => t.userId === userId);
        if (userTestimonials.length >= 3) {
            return res.json({ success: false, message: 'You can only add up to 3 testimonials for this course.' });
        }

        // Add testimonial
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        course.testimonials.push({
            userId,
            userName: user.name,
            userImage: user.imageUrl,
            rating: userRating.rating,
            comment: comment.trim(),
            createdAt: new Date()
        });

        await course.save();
        res.json({ success: true, message: 'Testimonial added successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Pin a testimonial (admin only)
export const pinTestimonial = async (req, res) => {
    try {
        const { courseId, testimonialIndex } = req.body;
        const userId = req.auth.userId;
        // Check if user is admin (for now, assume isAdmin is set on user)
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admin can pin testimonials.' });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }
        if (!course.testimonials[testimonialIndex]) {
            return res.json({ success: false, message: 'Testimonial not found' });
        }
        // Prevent duplicates
        const testimonial = course.testimonials[testimonialIndex];
        const alreadyPinned = course.pinnedTestimonials.some(t => t.userId === testimonial.userId && t.comment === testimonial.comment);
        if (alreadyPinned) {
            return res.json({ success: false, message: 'Testimonial already pinned.' });
        }
        // Only allow up to 3 pinned
        if (course.pinnedTestimonials.length >= 3) {
            return res.json({ success: false, message: 'You can only pin up to 3 testimonials.' });
        }
        course.pinnedTestimonials.push(testimonial);
        await course.save();
        res.json({ success: true, message: 'Testimonial pinned.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Unpin a testimonial (admin only)
export const unpinTestimonial = async (req, res) => {
    try {
        const { courseId, testimonialIndex } = req.body;
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ success: false, message: 'Only admin can unpin testimonials.' });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }
        if (!course.pinnedTestimonials[testimonialIndex]) {
            return res.json({ success: false, message: 'Pinned testimonial not found' });
        }
        course.pinnedTestimonials.splice(testimonialIndex, 1);
        await course.save();
        res.json({ success: true, message: 'Testimonial unpinned.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update getCourseTestimonials to return pinned and regular testimonials separately
export const getCourseTestimonials = async (req, res) => {
    try {
        const { courseId } = req.params;
        if (!courseId || courseId === 'undefined') {
            return res.json({ success: false, message: 'Invalid course ID' });
        }
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }
        res.json({
            success: true,
            pinnedTestimonials: course.pinnedTestimonials || [],
            testimonials: course.testimonials || []
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Manual payment endpoint
export const manualPayment = async (req, res) => {
    try {
        const { courseId, email, phoneNumber, location, selectedBank } = req.body;
        const userId = req.auth.userId;
        const paymentScreenshot = req.file;

        // Validate required fields
        if (!courseId || !email || !phoneNumber || !location || !selectedBank) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        if (!paymentScreenshot) {
            return res.json({ success: false, message: 'Payment screenshot is required' });
        }

        // Validate course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled
        if (course.enrolledStudents.includes(userId)) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        // Create purchase record
        const purchaseData = {
            courseId: course._id,
            userId,
            amount: (course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2),
            paymentMethod: 'manual',
            paymentStatus: 'pending',
            manualPaymentDetails: {
                email,
                phoneNumber,
                location,
                selectedBank,
                screenshotUrl: paymentScreenshot.path || paymentScreenshot.filename
            }
        };

        const newPurchase = await Purchase.create(purchaseData);

        // Update user data if needed
        const user = await User.findById(userId);
        if (user) {
            user.email = email;
            user.phoneNumber = phoneNumber;
            user.location = location;
            await user.save();
        }

        // Create payment success notification
        try {
            await createPaymentSuccessNotification(userId, courseId);
        } catch (error) {
            console.error('Error creating payment success notification:', error);
        }

        res.json({ 
            success: true, 
            message: 'Manual payment submitted successfully. We will verify and provide access soon.',
            purchaseId: newPurchase._id
        });

    } catch (error) {
        console.error('Manual payment error:', error);
        res.json({ success: false, message: error.message });
    }
};