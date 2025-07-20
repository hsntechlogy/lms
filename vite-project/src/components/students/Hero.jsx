import React, { useContext, useState, useRef } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import SearchBar from "./SearchBar";
import CourseCard from "./CourseCard";

const coinSVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#FFD700"/><circle cx="16" cy="16" r="13" fill="#FFF8DC"/><text x="50%" y="55%" text-anchor="middle" fill="#FFD700" font-size="16" font-family="Arial" dy=".3em">$</text></svg>`;
const billSVG = `<svg width="40" height="24" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="24" rx="5" fill="#4ADE80"/><rect x="4" y="4" width="32" height="16" rx="3" fill="#A7F3D0"/><text x="50%" y="60%" text-anchor="middle" fill="#059669" font-size="14" font-family="Arial" dy=".3em">$</text></svg>`;

const burstItems = [
  { svg: coinSVG, left: '10%' },
  { svg: billSVG, left: '28%' },
  { svg: coinSVG, left: '46%' },
  { svg: billSVG, left: '64%' },
  { svg: coinSVG, left: '82%' },
];

const techModels = [
  { svg: `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="40" height="20" rx="6" fill="#6366F1"/><rect x="18" y="28" width="24" height="4" rx="2" fill="#A5B4FC"/><rect x="24" y="32" width="12" height="2" rx="1" fill="#818CF8"/></svg>`, style: { left: '8%', top: '18%', animationDelay: '0s' } },
  { svg: `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="30" r="20" fill="#F59E42"/><rect x="22" y="28" width="16" height="4" rx="2" fill="#FDE68A"/><circle cx="30" cy="30" r="8" fill="#FBBF24"/></svg>`, style: { left: '70%', top: '12%', animationDelay: '0.7s' } },
  { svg: `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="16" width="28" height="28" rx="8" fill="#10B981"/><rect x="24" y="24" width="12" height="12" rx="3" fill="#6EE7B7"/></svg>`, style: { left: '20%', top: '70%', animationDelay: '1.2s' } },
  { svg: `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="40" rx="14" ry="8" fill="#3B82F6"/><rect x="22" y="18" width="16" height="16" rx="8" fill="#60A5FA"/><rect x="26" y="26" width="8" height="6" rx="3" fill="#1E40AF"/></svg>`, style: { left: '80%', top: '65%', animationDelay: '1.7s' } },
];

const Hero = () => {
  const { allCourses } = useContext(AppContext);
  const [empowerHovered, setEmpowerHovered] = useState(false);
  const [moneyRain, setMoneyRain] = useState(false);
  const moneyRainTimeout = useRef();
  const fitRef = useRef();

  // Trigger money rain animation
  const handleMoneyHover = () => {
    setMoneyRain(true);
    clearTimeout(moneyRainTimeout.current);
    moneyRainTimeout.current = setTimeout(() => setMoneyRain(false), 1200);
  };

  // Get width of fit your choice span for rain
  const getFitWidth = () => {
    if (fitRef.current) {
      return fitRef.current.offsetWidth;
    }
    return 160;
  };

  // Generate random positions for coins across full width
  const coins = Array.from({ length: 8 }).map((_, i) => {
    const left = Math.random() * (getFitWidth() - 32);
    return {
      left: `${left}px`,
      delay: `${i * 0.1}s`,
    };
  });

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{zIndex: 0}}>
        {techModels.map((model, i) => (
          <span
            key={i}
            className="tech-bg-model"
            style={{ ...model.style, position: 'absolute', animationDelay: model.style.animationDelay, zIndex: 0, pointerEvents: 'none' }}
            dangerouslySetInnerHTML={{ __html: model.svg }}
          />
        ))}
      </div>
      <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70 relative' >
        <h1 className='md:text-6xl text-3xl font-extrabold text-gray-800 max-w-3xl mx-auto relative' style={{lineHeight:'1.15'}}> 
          <span
            className={`empower-animate${empowerHovered ? ' empower-hovered' : ''}`}
            onMouseEnter={() => setEmpowerHovered(true)}
            onMouseLeave={() => setEmpowerHovered(false)}
            style={{marginRight: 8}}
          >
            <span className="empower-bg" />
            <span className="empower-word">Empower</span>
          </span>
          your future with the courses design to
          <span
            ref={fitRef}
            className='text-blue-600 relative cursor-pointer ml-2 inline-block'
            onMouseEnter={handleMoneyHover}
          >
            fit your choice.
            {/* Trending currency burst animation */}
            {moneyRain && (
              <span className="currency-burst" style={{width: getFitWidth(), height:'120px'}}>
                {burstItems.map((item, i) => (
                  <span
                    key={i}
                    className={`currency-burst-item currency-burst-animate`}
                    style={{ left: item.left, animationDelay: `${i * 0.08}s` }}
                    dangerouslySetInnerHTML={{ __html: item.svg }}
                  />
                ))}
              </span>
            )}
          </span>
        </h1>
        <div className="w-full flex justify-center">
          <img src={assets.sketch} alt='sketch' className='md:block hidden' style={{maxWidth:'180px', marginTop: 0}} />
        </div>
        <p className='md:block hidden text-xl font-semibold text-gray-700 max-w-2xl mx-auto'>We bring together world class instructor, interactive content and a sportive community to help you achieve your personal and professional goals</p>
        <p className='md:hidden text-lg font-semibold text-gray-700 max-w-sm mx-auto'>We bring together world class instructor, interactive content and a sportive community to help you achieve your personal and professional goals</p>
        <SearchBar/>
        {/* Course List Section for Home Page */}
        {allCourses && allCourses.length > 0 && (
          <div className='w-full max-w-6xl px-4'>
            <h2 className='text-3xl font-bold text-gray-800 mb-6 featured-animate'>Learn More with Our Featured Courses</h2>
            <div className='featured-courses-grid'>
              {allCourses.slice(0, 4).map((course, index) => (
                <CourseCard key={index} course={course} animationDelay={`${0.3 + index * 0.1}s`} />
              ))}
            </div>
            <div className='text-center mt-6'>
              <button
                onClick={() => window.location.href = '/courses'}
                className='bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors featured-animate'
                style={{animationDelay: '0.7s'}}
              >
                View All Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Hero;