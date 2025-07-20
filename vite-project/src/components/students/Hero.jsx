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

const astronautSVG = `<svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="35" cy="60" rx="18" ry="7" fill="#e5e7eb"/><circle cx="35" cy="32" r="18" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/><ellipse cx="35" cy="32" rx="10" ry="10" fill="#fff" stroke="#a1a1aa" stroke-width="2"/><rect x="30" y="42" width="10" height="12" rx="5" fill="#e5e7eb"/><rect x="28" y="54" width="14" height="6" rx="3" fill="#d1d5db"/></svg>`;
const rockSVG = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="50" rx="18" ry="8" fill="#f3f4f6"/><ellipse cx="30" cy="38" rx="14" ry="10" fill="#e5e7eb"/><ellipse cx="30" cy="38" rx="8" ry="6" fill="#d1d5db"/></svg>`;
const rocketSVG = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="28" y="10" width="4" height="28" rx="2" fill="#f3f4f6"/><polygon points="30,4 36,16 24,16" fill="#e5e7eb"/><ellipse cx="30" cy="40" rx="8" ry="10" fill="#f3f4f6"/><ellipse cx="30" cy="40" rx="4" ry="6" fill="#fff"/></svg>`;
const satelliteSVG = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="26" y="26" width="8" height="8" rx="2" fill="#f3f4f6"/><rect x="18" y="18" width="6" height="24" rx="2" fill="#e5e7eb"/><rect x="36" y="18" width="6" height="24" rx="2" fill="#e5e7eb"/><rect x="10" y="28" width="8" height="4" rx="2" fill="#d1d5db"/><rect x="42" y="28" width="8" height="4" rx="2" fill="#d1d5db"/></svg>`;

const spaceModels = [
  { svg: astronautSVG, style: { left: '8%', top: '18%', animationDelay: '0s' }, prompt: 'Secure your future with us!' },
  { svg: rockSVG, style: { left: '70%', top: '12%', animationDelay: '0.7s' }, prompt: 'Get ready to dive into the $10 trillion market.' },
  { svg: rocketSVG, style: { left: '20%', top: '70%', animationDelay: '1.2s' }, prompt: 'Book your ride to a stable future.' },
  { svg: satelliteSVG, style: { left: '80%', top: '65%', animationDelay: '1.7s' }, prompt: 'Stay connected, stay ahead.' },
];

const Hero = () => {
  const { allCourses } = useContext(AppContext);
  const [empowerHovered, setEmpowerHovered] = useState(false);
  const [moneyRain, setMoneyRain] = useState(false);
  const moneyRainTimeout = useRef();
  const fitRef = useRef();
  const [modelPrompt, setModelPrompt] = useState(null);

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
      <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70 relative' >
        <div className="absolute inset-0 w-full h-full pointer-events-auto z-0" style={{zIndex: 0}}>
          {spaceModels.map((model, i) => (
            <span
              key={i}
              className="tech-bg-model tech-bg-model-debug"
              style={{ ...model.style, position: 'absolute', animationDelay: model.style.animationDelay, zIndex: 0, pointerEvents: 'auto', cursor: 'pointer', opacity: 0.45, filter: 'drop-shadow(0 2px 8px #fff)' }}
              onClick={() => setModelPrompt(model.prompt)}
              dangerouslySetInnerHTML={{ __html: model.svg }}
            />
          ))}
        </div>
        {modelPrompt && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40" onClick={() => setModelPrompt(null)}>
            <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-xl font-semibold text-gray-800 max-w-md text-center animate-pop">
              {modelPrompt}
              <div className="mt-4 text-sm text-blue-600">Click anywhere to close</div>
            </div>
          </div>
        )}
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