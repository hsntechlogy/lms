import React from "react"
import { useContext } from "react"
import { Link } from "react-router-dom"
import { AppContext } from "../../context/AppContext"
import CourseCard from "./CourseCard"

const CourseSection = () =>{

    const { allCourses } = useContext(AppContext)

    return(
<div className="py-16 md:px-40 px-8" >
    <div className="text-center mb-12">
        <h2 className="text-3xl font-medium text-gray-800 mb-4" >Learn from the Best</h2>
        <p className="text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed" > 
            Discover our top-rated courses across various categories from coding and design to business and wellness. 
            Our courses are crafted to deliver results and are taught by industry experts with proven track records 
            in their respective fields. Whether you're a beginner or an advanced learner, our carefully curated 
            content will help you achieve your learning goals.
        </p>
    </div>
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

    {allCourses.slice(0,4).map((Course, index)=> <CourseCard key={index} course={Course} /> )}
</div>
 <div className="text-center mt-12">
  <Link
    to="/course-list"
    onClick={() => window.scrollTo(0, 0)}
    className="inline-block border border-gray-500/30 text-gray-700 px-10 py-3 rounded hover:bg-gray-100 transition"
  >
    Show All Courses
  </Link>
</div>
</div>
    )
}
export default CourseSection