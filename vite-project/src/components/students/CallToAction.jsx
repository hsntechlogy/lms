import  React from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const CallToAction = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/course-list');
  };

  const handleLearnMore = () => {
    navigate('/course-list');
  };

  return (
    <div className=" flex flex-col items-center gap-4 pt-10 pb-24 px-8 md:px-0 ">
      <h2 className='text-xl md:text-4xl text-gray-800 font-semibold' >Learn anything, anytime, anywhere</h2>
      <p className='text-gray-500 sm:text-sm' > loremdnsndsndsjdn sjdnsjdnj jsndjknsjdjsn jjdnjjs jdjshD HDDHI JJ</p>
     <div className='flex items-center font-medium gap-6 mt-4'   >
      <button 
        onClick={handleGetStarted}
        className='px-10 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors'
      >
        Get Started
      </button>
      <button 
        onClick={handleLearnMore}
        className='flex items-center gap-2 hover:text-blue-600 transition-colors'
      >
        Learn More <img src={assets.arrow_icon} alt='arrow' /> 
      </button>
     </div>
    </div>
  );
}       
export default CallToAction;