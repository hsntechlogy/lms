import User from "../models/Users.js"
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/course.js";
import { CourseProgress } from "../models/CourseProgress.js";

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

export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth.userId;

        // Validate courseId
        if (!courseId || courseId === 'undefined') {
            return res.json({ success: false, message: 'Invalid course ID' });
        }

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'User or course not found' });
        }

        // Check if already enrolled
        if (courseData.enrolledStudents.includes(userId)) {
            return res.json({ success: false, message: 'Already enrolled in this course' });
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        };

        const newPurchase = await Purchase.create(purchaseData);

        // Stripe Gateway Initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = (process.env.VITE_CURRENCY || 'usd').toLowerCase();

        // Creating line items for stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }];

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error('Purchase error:', error);
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

        if (rating < 1 || rating > 5) {
            return res.json({ success: false, message: 'Rating must be between 1 and 5' });
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

        // Check if user has rated the course 4 or 5 stars
        const userRating = course.courseRatings.find(r => r.userId === userId);
        if (!userRating || userRating.rating < 4) {
            return res.json({ success: false, message: 'You must rate the course 4 or 5 stars to add a testimonial' });
        }

        // Check if user has already added a testimonial
        const existingTestimonial = course.testimonials.find(t => t.userId === userId);
        if (existingTestimonial) {
            return res.json({ success: false, message: 'You have already added a testimonial for this course' });
        }

        // Get user data
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Add testimonial
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

export const getCourseTestimonials = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Validate courseId
        if (!courseId || courseId === 'undefined') {
            return res.json({ success: false, message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: 'Course not found' });
        }

        res.json({ success: true, testimonials: course.testimonials || [] });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};