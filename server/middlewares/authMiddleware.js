import { clerkClient } from "@clerk/express"

//middleware protect educator route
export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== 'educator') {
      return res.json({ success: false, message: 'Unauthorized Access' });
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

//middleware protect admin route
export const protectAdmin = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== 'admin') {
      return res.json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
