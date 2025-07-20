import React, { useContext, useState, useRef } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import SearchBar from "./SearchBar";
import CourseCard from "./CourseCard";

const moneySVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 47 46" fill="none"><ellipse cx="23.5" cy="23" rx="23.5" ry="23" fill="#FFD700"/><ellipse cx="23.5" cy="23" rx="19.5" ry="19" fill="#FFF8DC"/><text x="50%" y="55%" text-anchor="middle" fill="#FFD700" font-size="20" font-family="Arial" dy=".3em">$</text></svg>`;

const Hero = () => {
  const { allCourses } = useContext(AppContext);
  const [empowerHovered, setEmpowerHovered] = useState(false);
  const [moneyRain, setMoneyRain] = useState(false);
  const moneyRainTimeout = useRef();

  // Trigger money rain animation
  const handleMoneyHover = () => {
    setMoneyRain(true);
    clearTimeout(moneyRainTimeout.current);
    moneyRainTimeout.current = setTimeout(() => setMoneyRain(false), 1200);
  };

  // Generate random positions for coins
  const coins = Array.from({ length: 5 }).map((_, i) => ({
    left: `${10 + i * 20}%`,
    delay: `${i * 0.1}s`,
  }));

  return (
    <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70' >
      <h1 className='md:text-5xl text-3xl font-extrabold text-gray-800 max-w-3xl mx-auto relative' style={{lineHeight:'1.2'}}> 
        <span 
          className={`relative inline-block mr-2 ${empowerHovered ? 'empower-hovered' : ''}`}
          onMouseEnter={() => setEmpowerHovered(true)}
          onAnimationEnd={() => setEmpowerHovered(false)}
          style={{zIndex:1}}
        >
          <span className="empower-circle" />
          <span style={{position:'relative', zIndex:2}}>Empower</span>
        </span>
        your future with the courses design to 
        <span 
          className='text-blue-600 relative cursor-pointer ml-2' 
          onMouseEnter={handleMoneyHover}
        >
          fit your choice.
          {/* Money rain animation */}
          {moneyRain && (
            <span className="money-rain" style={{width:'160px', height:'120px'}}>
              {coins.map((coin, i) => (
                <span
                  key={i}
                  className="money-coin"
                  style={{ left: coin.left, animationDelay: coin.delay }}
                  dangerouslySetInnerHTML={{ __html: moneySVG }}
                />
              ))}
            </span>
          )}
        </span>
        <img src={assets.sketch} alt='sketch' className='md:block hidden absolute -bottom-7 right-0' />
      </h1>
      <p className='md:block hidden text-lg font-semibold text-gray-600 max-w-2xl mx-auto'>We bring together world class instructor, interactive content and a sportive community to help you achieve your personal and professional goals</p>
      <p className='md:hidden text-base font-semibold text-gray-600 max-w-sm mx-auto'>We bring together world class instructor, interactive content and a sportive community to help you achieve your personal and professional goals</p>
      <SearchBar/>
      {/* Course List Section for Home Page */}
      {allCourses && allCourses.length > 0 && (
        <div className='w-full max-w-6xl px-4'>
          <h2 className='text-2xl font-semibold text-gray-800 mb-6'>Learn More with Our Featured Courses</h2>
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