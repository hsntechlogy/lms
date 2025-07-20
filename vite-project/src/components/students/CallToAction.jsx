import  React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';

const CallToAction = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className=" flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0 ">
      <h2 className='text-xl md:text-4xl text-gray-800 font-semibold' >Learn More with Our Course Collection</h2>
      <p className='text-gray-500 sm:text-sm max-w-2xl text-center' >Explore our comprehensive collection of courses designed to help you master new skills and advance your career. From beginner to advanced levels, we have something for everyone.</p>
      
      {/* Course List Section */}
      {allCourses && allCourses.length > 0 && (
        <div className='w-full max-w-6xl mt-8'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {allCourses.slice(0, 8).map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
          <div className='text-center mt-8'>
            <button 
              onClick={() => window.location.href = '/courses'}
              className='bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors'
            >
              Explore All Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}       
export default CallToAction;