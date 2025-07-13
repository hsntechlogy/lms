import mongoose from "mongoose"

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('Database Connected'))
        mongoose.connection.on('error', (err) => console.log('Database connection error:', err))

        await mongoose.connect(`${process.env.MONGODB_URL}/lms`, {
            writeConcern: {
                w: 'majority',
                j: true,
                wtimeout: 10000
            },
            readConcern: {
                level: 'majority'
            }
        })
    } catch (error) {
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}

export default connectDB