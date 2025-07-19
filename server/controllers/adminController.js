import { clerkClient } from '@clerk/clerk-sdk-node';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/course.js';
import User from '../models/Users.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const adminId = req.auth.userId;

        // Check if the current user is an admin
        const currentUser = await clerkClient.users.getUser(adminId);
        if (currentUser.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Admin access required' });
        }

        // Get all users from Clerk
        const users = await clerkClient.users.getUserList();
        
        // Format user data
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
            email: user.emailAddresses[0]?.emailAddress || 'No email',
            imageUrl: user.imageUrl,
            role: user.publicMetadata.role || 'student',
            createdAt: user.createdAt
        }));

        res.json({ success: true, users: formattedUsers });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get user statistics (admin only)
export const getUserStats = async (req, res) => {
    try {
        const adminId = req.auth.userId;

        // Check if the current user is an admin
        const currentUser = await clerkClient.users.getUser(adminId);
        if (currentUser.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Admin access required' });
        }

        // Get all users from Clerk
        const users = await clerkClient.users.getUserList();
        
        // Calculate statistics
        const stats = {
            totalUsers: users.length,
            students: users.filter(user => user.publicMetadata.role === 'student' || !user.publicMetadata.role).length,
            educators: users.filter(user => user.publicMetadata.role === 'educator').length,
            admins: users.filter(user => user.publicMetadata.role === 'admin').length
        };

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get manual payments (admin only)
export const getManualPayments = async (req, res) => {
    try {
        const adminId = req.auth.userId;

        // Check if the current user is an admin
        const currentUser = await clerkClient.users.getUser(adminId);
        if (currentUser.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Admin access required' });
        }

        // Get all manual payments with populated user and course data
        const payments = await Purchase.find({ paymentMethod: 'manual' })
            .populate('courseId', 'courseTitle')
            .populate('userId', 'name imageUrl')
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        console.error('Error fetching manual payments:', error);
        res.json({ success: false, message: error.message });
    }
};

// Verify manual payment (admin only)
export const verifyPayment = async (req, res) => {
    try {
        const adminId = req.auth.userId;
        const { paymentId, status } = req.body;

        // Check if the current user is an admin
        const currentUser = await clerkClient.users.getUser(adminId);
        if (currentUser.publicMetadata.role !== 'admin') {
            return res.json({ success: false, message: 'Admin access required' });
        }

        if (!paymentId || !status) {
            return res.json({ success: false, message: 'Payment ID and status are required' });
        }

        if (!['verified', 'rejected'].includes(status)) {
            return res.json({ success: false, message: 'Invalid status. Must be verified or rejected' });
        }

        // Find the payment
        const payment = await Purchase.findById(paymentId);
        if (!payment) {
            return res.json({ success: false, message: 'Payment not found' });
        }

        // Update payment status
        payment.paymentStatus = status;
        await payment.save();

        // If payment is verified, enroll the user in the course
        if (status === 'verified') {
            const course = await Course.findById(payment.courseId);
            if (course && !course.enrolledStudents.includes(payment.userId)) {
                course.enrolledStudents.push(payment.userId);
                await course.save();
            }
        }

        res.json({ 
            success: true, 
            message: `Payment ${status} successfully`,
            payment 
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.json({ success: false, message: error.message });
    }
}; 