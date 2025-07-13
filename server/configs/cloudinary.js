import  {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async () => {
    try {
        // Check if environment variables are set
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
            console.warn('⚠️ Cloudinary environment variables are not set. Image uploads will use placeholder images.');
            return false;
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY,
        });

        // Test the configuration
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Cloudinary connection failed:', error.message);
        console.warn('⚠️ Image uploads will use placeholder images.');
        return false;
    }
}

export default connectCloudinary