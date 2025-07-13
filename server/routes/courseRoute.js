import express from "express";
import { getAllCourse, getAllCoursesDebug, getCourseId, fixCoursesWithMissingEducators } from '../controllers/courseController.js';

const courseRouter = express.Router();

// ✅ Define this first to avoid conflict with :id route
courseRouter.get('/all', getAllCourse);

// Debug route to get all courses regardless of published status
courseRouter.get('/all-debug', getAllCoursesDebug);

// Fix route for courses with missing educator data
courseRouter.post('/fix-educators', fixCoursesWithMissingEducators);

// Then define dynamic route
courseRouter.get('/:id', getCourseId);

export default courseRouter;
