import express from "express";
import { getAllCourse, getCourseId } from '../controllers/courseController.js';

const courseRouter = express.Router();

// ✅ Define this first to avoid conflict with :id route
courseRouter.get('/all', getAllCourse);

// Then define dynamic route
courseRouter.get('/:id', getCourseId);

export default courseRouter;
