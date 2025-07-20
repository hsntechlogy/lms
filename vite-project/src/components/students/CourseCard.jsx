import React from 'react';
import { assets } from '../../assets/assets';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom'

const CourseCard = ({ course, animationDelay }) => {
  const { currency, CalculateRating } = useContext(AppContext)

  const handleImageError = (e) => {
    e.target.src = assets.course_1; // Fallback image
  };

  return (
    <Link to={'/course/' + course._id} onClick={() => window.scrollTo(0, 0)} 
     className={`border border-gray-500/30 pb-6 overflow-hidden rounded-lg course-card-animate course-card-fixed`} 
     style={{animationDelay: animationDelay}}>
      <img 
        className='w-full h-40 object-cover' 
        src={course.courseThumbnail || assets.course_1} 
        alt={course.courseTitle}
        onError={handleImageError}
      />
      <div className='p-3 text-left flex flex-col justify-between h-full'>
        <h3 className='text-base font-semibold mb-1' >{course.courseTitle}</h3>
        <p className='text-gray-500 mb-1' >{course.educator?.name || 'Unknown Educator'}</p>
        <div className='flex items-center space-x-2 mb-1'>
          <p>{CalculateRating(course)}</p>
          <div className='flex' >
            {[...Array(5)].map((_, i) => (
              <img key={i} src={i < Math.floor(CalculateRating(course)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />
            ))}
          </div>
          <p className='text-gray-500' >{course.courseRatings?.length || 0}</p>
        </div>
        <p className='text-base font-semibold text-gray-800 mt-auto' > {currency} {(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)} </p>
      </div>
    </Link>
  );
}       

export default CourseCard;