
import Course from "../models/course.js";
export const getAllCourse = async (req, res) => {
    try {
        console.log('Fetching all published courses...');
        const courses = await Course.find({ isPublished: true }).select(['-courseContent', '-enrolledStudents']).populate({ path: 'educator' })
        console.log(`Found ${courses.length} courses`);
        
        res.json({ success: true, course: courses })
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

        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            })
        })
        res.json({ success: true, courseData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
