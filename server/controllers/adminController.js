import { clerkClient } from '@clerk/clerk-sdk-node';

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