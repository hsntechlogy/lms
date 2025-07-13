import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router';
import YouTube from 'react-youtube';
import humanizeDuration from 'humanize-duration';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/students/Footer';
import Rating from '../../components/students/Rating'; // Assuming Rating is used but not imported
import { toast } from 'react-toastify';
import axios from 'axios';
import Loading from '../../components/students/Loading';

const Player = () => {
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [courseData, setCourseData] = useState(null);

  const { enrolledCourses, calculateChapterTime,backendUrl,getToken,userData,fetchUserEnrolledCourses } = useContext(AppContext);
  const { courseId } = useParams();
  const [progressData,setProgressData]=useState(null)
  const [initialRating,setInitialRating]=useState(0)

  // Function to extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return '';
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*&v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    // If no pattern matches, try to extract the last part as video ID
    return url.split('/').pop().split('?')[0];
  };

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id == courseId) {
        setCourseData(course);
        course.courseRatings.map((item) => {
          if(item.userId === userData._id){
            setInitialRating(item.rating)
          }
        })
      }
    });
  };

  useEffect(() => {
   if(enrolledCourses.length>0){
    getCourseData();
    }  
  }, [enrolledCourses]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken()
      const {data} = await axios.post(backendUrl+'/api/user/update-course-progress',{courseId,lectureId},{headers:{Authorization:`Bearer ${token}`}})
      if(data.success){
        toast.success(data.message)
        getCourseProgress()
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.success(error.message)
    }
  }
  const getCourseProgress =async () => {
    try {
      const token= await getToken()
      const {data}= await axios.post(backendUrl+'/api/user/get-course-progress',{courseId},{headers:{Authorization:`Bearer ${token}`
      }})
      if (data.success){
        setProgressData(data.progressData)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
   toast.error(error.message)
      
    }
  }
const handleRate = async (rating) => {
  try {
    const token = await getToken()
    const {data } = await axios.post(backendUrl+'/api/user/add-rating',{courseId,rating},{headers:{Authorization:`Bearer ${token}`}})

     if (data.success){
        toast.success(data.message)
        fetchUserEnrolledCourses()
      }else{
        toast.error(data.message)
      }
  } catch (error) {
    toast.error(error.message)
  }
}
useEffect(()=>{
  getCourseProgress()
},[])
  return courseData ? (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid-cols-2 gap-10 md:px-36">
        {/* Left Column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSections[index] ? 'rotate-180' : ''
                        }`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                      />
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex gap-2 py-1 items-start">
                          <img
                            src={progressData&&progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  watch
                                </p>
                              )}
                              <p>
                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                  units: ['h', 'm'],
                                })}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this course</h1>
            <Rating initialRating={initialRating} onRate={handleRate} />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <YouTube
                videoId={extractVideoId(playerData.lectureUrl)}
                iframeClassName="w-full aspect-video"
                onError={(error) => console.error('YouTube player error:', error)}
              />
              <div className="flex justify-between items-center mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                </p>
                <button onClick={()=>markLectureAsCompleted(playerData.lectureId)} className="text-blue-600">
                  {progressData&&progressData.lectureCompleted.includes(playerData.lectureId) ? 'completed' : 'Mark completed'}
                </button>
              </div>
            </div>
          ) : (
            <img 
              src={courseData ? courseData.courseThumbnail : ''} 
              alt="Course thumbnail"
              onError={(e) => {
                e.target.src = assets.course_1;
              }}
            />
          )}
        </div>
      </div>

      <Footer />
    </>
  ):<Loading/>
}

export default Player;
