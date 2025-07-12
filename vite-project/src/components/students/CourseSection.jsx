import React from "react"
import { useContext } from "react"
import { Link } from "react-router-dom"
import { AppContext } from "../../context/AppContext"
import CourseCard from "./CourseCard"

const CourseSection = () =>{

    const { allCourses } = useContext(AppContext)

    return(
<div className="py-16 md:px-40 px-8" >
    <h2 className="text-3xl font-medium text-gray-800" >learn from the best</h2>
    <p className="text-sm md:text-base" > discover our top rated courses across various categories from coding and design to <br/> business and Wellness our courses are crafted to deliver result </p>
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

    {allCourses.slice(0,4).map((Course, index)=> <CourseCard key={index} course={Course} /> )}
</div>
 <div className="text-center mt-12">
  <Link
    to="/"
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