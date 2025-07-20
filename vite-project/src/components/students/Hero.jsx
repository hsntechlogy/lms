import  React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import SearchBar from "./SearchBar";
import CourseCard from "./CourseCard";

const Hero = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center
    bg-gradient-to-b from-cyan-100/70' >
      <h1 className='md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto' > Empower your future with the courses design to <span  className='text-blue-600' >fit your choice.
        </span>< img src={assets.sketch} alt='sketch' className='md:block hidden absolute -bottom-7 right-0' /></h1>
<p  className='md:block hidden text-gray-500 max-w-2xl mx-auto' >We bring together world class instructor, interactive content and a sportive community to help you achieve your personal and professional goals  </p>
   
<p  className='md:hidden text-gray-500 max-w-sm mx-auto' >We bring together world class instructor, interactive content and a sportive community to help you achieve your personal and professional goals  </p>
<SearchBar/>

      {/* Featured Courses Section */}
      {allCourses && allCourses.length > 0 && (
        <div className='w-full max-w-6xl px-4'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Get Started with Our Featured Courses</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {allCourses.slice(0, 4).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          <div className='text-center mt-6'>
            <button 
              onClick={() => window.location.href = '/courses'}
              className='bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors'
            >
              View All Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}       
export default Hero;