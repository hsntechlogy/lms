import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    courseId:{type:String,required:true},
    completed:{type:String,required:false},
    lectureCompleted:[]
  },{minimize:false})

  export const CourseProgress = mongoose.model('CourseProgress',courseProgressSchema)