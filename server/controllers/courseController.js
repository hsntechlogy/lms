
import Course from "../models/course.js";
import User from "../models/Users.js";
import { clerkClient } from '@clerk/clerk-sdk-node';

// Debug function to get all courses regardless of published status
export const getAllCoursesDebug = async (req, res) => {
    try {
        console.log('Fetching ALL courses (debug)...');
        const allCourses = await Course.find({}).select(['-courseContent', '-enrolledStudents']).populate({ path: 'educator' })
        console.log(`Found ${allCourses.length} total courses`);
        
        const publishedCourses = allCourses.filter(course => course.isPublished === true);
        const unpublishedCourses = allCourses.filter(course => course.isPublished !== true);
        
        console.log(`Published courses: ${publishedCourses.length}`);
        console.log(`Unpublished courses: ${unpublishedCourses.length}`);
        
        res.json({ 
            success: true, 
            allCourses: allCourses,
            publishedCourses: publishedCourses,
            unpublishedCourses: unpublishedCourses
        })
    } catch (error) {
        console.error('Error fetching all courses:', error);
        res.json({ success: false, message: error.message })
    }
}

export const getAllCourse = async (req, res) => {
    try {
        console.log('Fetching all published courses...');
        // Get courses that are either published or don't have isPublished field set
        const courses = await Course.find({ 
            $or: [
                { isPublished: true },
                { isPublished: { $exists: false } }
            ]
        }).select(['-courseContent', '-enrolledStudents']).populate({ 
            path: 'educator',
            select: 'name imageUrl'
        })
        console.log(`Found ${courses.length} courses`);
        
        // Filter out courses without valid educator data
        const validCourses = courses.filter(course => {
            if (!course.educator) {
                console.log(`Course ${course._id} has no educator data`);
                return false;
            }
            return true;
        });
        
        console.log(`Valid courses with educator data: ${validCourses.length}`);
        
        res.json({ success: true, course: validCourses })
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.json({ success: false, message: error.message })
    }
}

//get course by id
export const getCourseId = async (req, res) => {
    const { id } = req.params
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' })

        if (!courseData) {
            return res.json({ success: false, message: "Course not found" })
        }

        // Update thumbnail if it's using the failing placeholder URL
        if (courseData.courseThumbnail && courseData.courseThumbnail.includes('via.placeholder.com')) {
            courseData.courseThumbnail = 'https://picsum.photos/400/300?random=' + courseData._id;
            await courseData.save();
            console.log(`Updated thumbnail for course ${courseData._id}`);
        }

        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            })
        })
        // Add testimonials and pinnedTestimonials to the response
        res.json({ 
            success: true, 
            courseData,
            testimonials: courseData.testimonials || [],
            pinnedTestimonials: courseData.pinnedTestimonials || []
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Function to fix courses with missing educator data
export const fixCoursesWithMissingEducators = async (req, res) => {
    try {
        console.log('Fixing courses with missing educator data...');
        
        // Get all courses
        const allCourses = await Course.find({});
        console.log(`Found ${allCourses.length} total courses`);
        
        let fixedCount = 0;
        let skippedCount = 0;
        
        for (const course of allCourses) {
            if (!course.educator) {
                console.log(`Course ${course._id} has no educator, skipping...`);
                skippedCount++;
                continue;
            }
            
            // Check if educator exists in User collection
            const educatorUser = await User.findById(course.educator);
            if (!educatorUser) {
                console.log(`Creating missing educator user for course ${course._id}`);
                
                try {
                    // Get educator info from Clerk
                    const clerkUser = await clerkClient.users.getUser(course.educator);
                    if (clerkUser) {
                        // Create User document
                        await User.create({
                            _id: course.educator,
                            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown',
                            email: clerkUser.emailAddresses[0]?.emailAddress || 'No email',
                            imageUrl: clerkUser.imageUrl
                        });
                        fixedCount++;
                        console.log(`Created educator user for course ${course._id}`);
                    } else {
                        console.log(`Clerk user not found for educator ${course.educator}`);
                        skippedCount++;
                    }
                } catch (error) {
                    console.error(`Error creating educator user for course ${course._id}:`, error);
                    skippedCount++;
                }
            } else {
                console.log(`Educator user already exists for course ${course._id}`);
            }
        }
        
        res.json({ 
            success: true, 
            message: `Fixed ${fixedCount} courses, skipped ${skippedCount} courses`,
            fixedCount,
            skippedCount
        });
    } catch (error) {
        console.error('Error fixing courses:', error);
        res.json({ success: false, message: error.message });
    }
}

// Function to manually update all course thumbnails
export const updateAllCourseThumbnails = async (req, res) => {
    try {
        console.log('Updating all course thumbnails...');
        
        const allCourses = await Course.find({});
        console.log(`Found ${allCourses.length} total courses`);
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        for (const course of allCourses) {
            if (course.courseThumbnail && course.courseThumbnail.includes('via.placeholder.com')) {
                course.courseThumbnail = 'https://picsum.photos/400/300?random=' + course._id;
                await course.save();
                updatedCount++;
                console.log(`Updated thumbnail for course ${course._id}`);
            } else {
                skippedCount++;
            }
        }
        
        res.json({ 
            success: true, 
            message: `Updated ${updatedCount} course thumbnails, skipped ${skippedCount} courses`,
            updatedCount,
            skippedCount
        });
    } catch (error) {
        console.error('Error updating course thumbnails:', error);
        res.json({ success: false, message: error.message });
    }
}

//get all courses
export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate('educator', 'name imageUrl')
        
        // Update any courses with failing placeholder URLs
        for (let course of courses) {
            if (course.courseThumbnail && course.courseThumbnail.includes('via.placeholder.com')) {
                course.courseThumbnail = 'https://picsum.photos/400/300?random=' + course._id;
                await course.save();
            }
        }
        
        res.json({ success: true, course: courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
