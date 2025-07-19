import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router';
import YouTube from 'react-youtube';
import humanizeDuration from 'humanize-duration';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/students/Footer';
import Rating from '../../components/students/Rating';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loading from '../../components/students/Loading';

const Player = () => {
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialComment, setTestimonialComment] = useState('');
  const [testimonials, setTestimonials] = useState([]);

  const { enrolledCourses, calculateChapterTime, backendUrl, getToken, userData, fetchUserEnrolledCourses } = useContext(AppContext);
  const { courseId } = useParams();
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  // Function to check if text contains only English characters
  const isEnglishOnly = (text) => {
    const englishRegex = /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>/\n\r]*$/;
    return englishRegex.test(text);
  };

  
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
          if (item.userId === userData._id) {
            setInitialRating(item.rating);
          }
        });
      }
    });
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
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
      const token = await getToken();
      const url = backendUrl.replace(/\/$/, '') + '/api/user/update-course-progress';
      const { data } = await axios.post(
        url,
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        getCourseProgress();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCourseProgress = async () => {
    if (!courseId) {
      toast.error('Course ID is missing');
      return;
    }
    const token = await getToken();
    if (!token) {
      toast.error('User token is missing. Please log in again.');
      return;
    }
    try {
      const url = backendUrl.replace(/\/$/, '') + '/api/user/get-course-progress';
      const { data } = await axios.post(
        url,
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setProgressData(data.progressData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRate = async (rating) => {
    console.log('handleRate called with rating:', rating);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        console.log('Rating successful:', data.message);
        toast.success(data.message);
        fetchUserEnrolledCourses();
        // Update the local course data to reflect the new rating
        if (courseData) {
          const updatedCourse = { ...courseData };
          const existingRatingIndex = updatedCourse.courseRatings.findIndex(r => r.userId === userData._id);
          if (existingRatingIndex > -1) {
            updatedCourse.courseRatings[existingRatingIndex].rating = rating;
          } else {
            updatedCourse.courseRatings.push({ userId: userData._id, rating });
          }
          setCourseData(updatedCourse);
        }
      } else {
        console.log('Rating failed:', data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.log('Rating error:', error.message);
      toast.error(error.message);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const url = backendUrl.replace(/\/$/, '') + '/api/user/testimonials/' + courseId;
      const { data } = await axios.get(url);
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleAddTestimonial = async () => {
    if (!testimonialComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!isEnglishOnly(testimonialComment)) {
      toast.error('Please write your comment in English only');
      return;
    }

    try {
      const token = await getToken();
      const url = backendUrl.replace(/\/$/, '') + '/api/user/add-testimonial';
      const { data } = await axios.post(
        url,
        { courseId, comment: testimonialComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setTestimonialComment('');
        setShowTestimonialForm(false);
        fetchTestimonials();
        // Update local course data
        if (courseData) {
          const updatedCourse = { ...courseData };
          const userRating = updatedCourse.courseRatings.find(r => r.userId === userData._id);
          if (userRating) {
            updatedCourse.testimonials.push({
              userId: userData._id,
              userName: userData.name,
              userImage: userData.imageUrl,
              rating: userRating.rating,
              comment: testimonialComment,
              createdAt: new Date()
            });
            setCourseData(updatedCourse);
          }
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const canAddTestimonial = () => {
    if (!courseData || !userData) return false;
    
    const userRating = courseData.courseRatings.find(r => r.userId === userData._id);
    const hasTestimonial = courseData.testimonials?.find(t => t.userId === userData._id);
    
    return userRating && userRating.rating >= 4 && !hasTestimonial;
  };

  useEffect(() => {
    getCourseProgress();
    fetchTestimonials();
  }, []);

  // Only allow video playback if enrolled or isPreviewFree
  const canWatchLecture = playerData && (enrolledCourses.some(c => c._id === courseId) || playerData.isPreviewFree);

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
                            src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
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
                                  className="text-blue-500 cursor-pointer hover:text-blue-700"
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

          {/* Rating Section - Always visible, prompt login/enrollment if needed */}
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this course</h1>
            {userData && courseData ? (
              <Rating initialRating={initialRating} onRate={handleRate} />
            ) : (
              <span className="text-gray-500 ml-2">Login and enroll to rate this course</span>
            )}
          </div>

          {/* Testimonials Section - Always visible, show placeholder if none */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Testimonials</h2>
            {userData && courseData && canAddTestimonial() && (
              <div className="mb-6">
                <button
                  onClick={() => setShowTestimonialForm(!showTestimonialForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {showTestimonialForm ? 'Cancel' : 'Add Testimonial'}
                </button>
                {showTestimonialForm && (
                  <div className="mt-4">
                    <textarea
                      className="w-full border rounded p-2 mb-2"
                      rows={3}
                      placeholder="Share your experience..."
                      value={testimonialComment}
                      onChange={e => setTestimonialComment(e.target.value)}
                    />
                    <button
                      onClick={handleAddTestimonial}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      disabled={!testimonialComment.trim()}
                    >
                      Submit Testimonial
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Display Testimonials or Placeholder */}
            {testimonials && testimonials.length > 0 ? (
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border border-gray-300 rounded p-4 bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={testimonial.userImage || assets.profile_img_1}
                        alt={testimonial.userName}
                        className="w-10 h-10 rounded-full"
                        onError={e => { e.target.src = assets.profile_img_1; }}
                      />
                      <div>
                        <h4 className="font-semibold">{testimonial.userName}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{testimonial.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No testimonials yet. Be the first to share your experience after rating this course 4 or 5 stars!
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="md:mt-10">
          {playerData ? (
            canWatchLecture ? (
              <div>
                <div className="relative">
                  <YouTube
                    videoId={extractVideoId(playerData.lectureUrl)}
                    iframeClassName="w-full h-48 sm:h-64 md:h-72 lg:h-80 rounded"
                    onError={(error) => {
                      console.error('YouTube player error:', error);
                      toast.error('Error loading video. Please check the URL.');
                    }}
                    opts={{
                      playerVars: {
                        autoplay: 1,
                        modestbranding: 1,
                        rel: 0
                      }
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium">
                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                  </p>
                  <button 
                    onClick={() => markLectureAsCompleted(playerData.lectureId)} 
                    className={`px-4 py-2 rounded font-medium transition-colors ${
                      progressData && progressData.lectureCompleted.includes(playerData.lectureId)
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? '✓ Completed' : 'Mark as completed'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-red-500 font-semibold py-10">You must enroll in this course to watch this lecture.</div>
            )
          ) : (
            <div className="text-center">
              <img 
                src={courseData && courseData.courseThumbnail ? courseData.courseThumbnail : assets.course_1} 
                alt="Course thumbnail"
                className="w-full h-48 sm:h-64 md:h-72 lg:h-80 rounded object-cover"
                onError={(e) => {
                  e.target.src = assets.course_1;
              }}
              />
              <p className="mt-4 text-gray-600">Select a lecture to start watching</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default Player;
