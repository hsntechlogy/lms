import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Youtube from 'react-youtube';
import humanizeDuration from 'humanize-duration';

import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import Loading from '../../components/students/Loading';
import Footer from '../../components/students/Footer';
import Rating from '../../components/students/Rating';

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpensections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [PlayerData, setPlayerData] = useState(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialComment, setTestimonialComment] = useState('');
  const [testimonials, setTestimonials] = useState([]);
  const [initialRating, setInitialRating] = useState(0);
  const [progressData, setProgressData] = useState(null);
  // Add state for pinned testimonials, view all toggle, and admin check
  const [pinnedTestimonials, setPinnedTestimonials] = useState([]);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);

  const {
    CalculateRating,
    calculateNoOfLectures,
    calculateCourseDuration,
    calculateChapterTime,
    currency,
    backendUrl,
    userData,
    getToken,
    enrolledCourses,
  } = useContext(AppContext);

  const isAdmin = userData && userData.isAdmin;

  // Function to check if text contains only English characters
  const isEnglishOnly = (text) => {
    const englishRegex = /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=[\]{};':"\\|<>/\n\r]*$/;
    return englishRegex.test(text);
  };

  // Function to get course progress
  const getCourseProgress = async () => {
    if (!id) {
      toast.error('Course ID is missing');
      return;
    }
    const token = await getToken();
    if (!token) {
      toast.error('User token is missing. Please log in again.');
      return;
    }
    try {
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/user/get-course-progress',
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setProgressData(data.progressData);
      } else {
        console.log('Progress fetch failed:', data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.log('Progress fetch error:', error.message);
      toast.error(error.message);
    }
  };

  // Function to mark lecture as completed
  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/user/update-course-progress',
        { courseId: id, lectureId },
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

  // Test function for mark as read (for testing purposes)
  const testMarkAsRead = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/user/update-course-progress',
        { courseId: id, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Test: ' + data.message);
        getCourseProgress();
      } else {
        toast.error('Test failed: ' + data.message);
      }
    } catch (error) {
      toast.error('Test error: ' + error.message);
    }
  };

  const fetchCourseData = async () => {
    try {
      if (!id) {
        toast.error('Course ID is missing');
        return;
      }

      const { data } = await axios.get(
        backendUrl.replace(/\/$/, '') + '/api/course/' + id
      );

      if (data.success) {
        setCourseData(data.courseData);
        setTestimonials(data.testimonials || []);
        setPinnedTestimonials(data.pinnedTestimonials || []);
        // Set initial rating if user has already rated
        if (userData && data.courseData.courseRatings) {
          const userRating = data.courseData.courseRatings.find(r => r.userId === userData._id);
          if (userRating) {
            setInitialRating(userRating.rating);
          }
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Update fetchTestimonials to get pinned and regular testimonials
  const fetchTestimonials = async () => {
    try {
      if (!id) return;
      const { data } = await axios.get(
        backendUrl.replace(/\/$/, '') + '/api/user/testimonials/' + id
      );
      if (data.success) {
        setPinnedTestimonials(data.pinnedTestimonials || []);
        setTestimonials(data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const handleRate = async (rating) => {
    console.log('handleRate called with rating:', rating);
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/user/add-rating',
        { courseId: id, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        console.log('Rating successful:', data.message);
        toast.success(data.message);
        // Update local course data
        if (courseData) {
          const updatedCourse = { ...courseData };
          const existingRatingIndex = updatedCourse.courseRatings.findIndex(r => r.userId === userData._id);
          if (existingRatingIndex > -1) {
            updatedCourse.courseRatings[existingRatingIndex].rating = rating;
          } else {
            updatedCourse.courseRatings.push({ userId: userData._id, rating });
          }
          setCourseData(updatedCourse);
          setInitialRating(rating);
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
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/user/add-testimonial',
        { courseId: id, comment: testimonialComment },
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

  const enrollCourse = async () => {
    try {
      if (!userData) return toast.warn('Login to Enroll');
      if (isAlreadyEnrolled) return toast.warn('Already Enrolled');
      if (!courseData || !courseData._id) {
        return toast.error('Course data is missing');
      }

      const token = await getToken();
      const url = backendUrl.endsWith('/') ? backendUrl + 'api/user/purchase' : backendUrl + '/api/user/purchase';
      const { data } = await axios.post(
        url,
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseData();
      fetchTestimonials();
      getCourseProgress(); // Fetch progress on mount
    }
  }, [id]);

  useEffect(() => {
    if (userData && courseData && enrolledCourses) {
      setIsAlreadyEnrolled(enrolledCourses.some(course => course._id === courseData._id));
    }
  }, [userData, courseData, enrolledCourses]);

  if (!courseData) return <Loading />;

  const toggleSection = (index) => {
    setOpensections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
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
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
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
                            src={progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  onClick={() => {
                                    if (isAlreadyEnrolled || lecture.isPreviewFree) {
                                      setPlayerData({
                                        ...lecture,
                                        chapter: index + 1,
                                        lecture: i + 1,
                                      });
                                    } else {
                                      toast.error('Enroll in the course to watch this lecture.');
                                    }
                                  }}
                                  className={`text-blue-500 cursor-pointer hover:text-blue-700 ${!isAlreadyEnrolled && !lecture.isPreviewFree ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                  {lecture.isPreviewFree ? 'Preview' : 'Watch'}
                                </p>
                              )}
                              {isAlreadyEnrolled && (
                                <button
                                  onClick={() => markLectureAsCompleted(lecture.lectureId)}
                                  className={`text-xs px-2 py-1 rounded transition-colors ${
                                    progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(lecture.lectureId)
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(lecture.lectureId) ? '✓ Read' : 'Mark as Read'}
                                </button>
                              )}
                              {/* Test button for mark as read (always visible for testing) */}
                              <button
                                onClick={() => testMarkAsRead(lecture.lectureId)}
                                className="text-xs px-2 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                                title="Test mark as read functionality"
                              >
                                Test Mark
                              </button>
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
            {userData && isAlreadyEnrolled ? (
              <Rating initialRating={initialRating} onRate={handleRate} />
            ) : (
              <span className="text-gray-500 ml-2">Login and enroll to rate this course</span>
            )}
          </div>

          {/* Testimonials Section - Always visible, show placeholder if none */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Testimonials</h2>
            {/* Pinned Testimonials */}
            {pinnedTestimonials && pinnedTestimonials.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-blue-700 mb-2">Pinned by Admin</h3>
                <div className="space-y-4">
                  {pinnedTestimonials.map((testimonial, index) => (
                    <div key={index} className="border-2 border-blue-400 rounded p-4 bg-blue-50">
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
                      {isAdmin && (
                        <button
                          className="mt-2 text-xs text-red-600 border border-red-400 px-2 py-1 rounded hover:bg-red-50"
                          onClick={async () => {
                            const token = await getToken();
                            await axios.post(
                              backendUrl.replace(/\/$/, '') + '/api/educator/unpin-testimonial',
                              { courseId: id, testimonialIndex: index },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            fetchTestimonials();
                          }}
                        >
                          Unpin
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Regular Testimonials (show 3 by default) */}
            {testimonials && testimonials.length > 0 ? (
              <div className="space-y-4">
                {(showAllTestimonials ? testimonials : testimonials.slice(0, 3)).map((testimonial, index) => (
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
                    {isAdmin && (
                      <button
                        className="mt-2 text-xs text-blue-600 border border-blue-400 px-2 py-1 rounded hover:bg-blue-50"
                        onClick={async () => {
                          const token = await getToken();
                          await axios.post(
                            backendUrl.replace(/\/$/, '') + '/api/educator/pin-testimonial',
                            { courseId: id, testimonialIndex: index },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          fetchTestimonials();
                        }}
                      >
                        Pin
                      </button>
                    )}
                  </div>
                ))}
                {/* View All Button for admin/educator */}
                {testimonials.length > 3 && !showAllTestimonials && (
                  <button
                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-blue-700"
                    onClick={() => setShowAllTestimonials(true)}
                  >
                    View All Comments
                  </button>
                )}
                {showAllTestimonials && (
                  <button
                    className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-blue-700"
                    onClick={() => setShowAllTestimonials(false)}
                  >
                    Show Less
                  </button>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No testimonials yet. Be the first to share your experience after rating this course 5 stars!
              </p>
            )}
          </div>

          {/* Full description */}
          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
            ></p>
          </div>
        </div>

        {/* Right Column */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {PlayerData ? (
            <Youtube
              videoId={PlayerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail || assets.course_1} alt="Course thumbnail" onError={e => { e.target.src = assets.course_1; }} />
          )}

          <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">{courseData.courseTitle}</h1>
            <p className="text-gray-600 mb-4">{courseData.educator?.name || 'Unknown Educator'}</p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(CalculateRating(courseData)) ? assets.star : assets.star_blank}
                    alt=""
                    className="w-4 h-4"
                  />
                ))}
              </div>
              <span className="text-gray-500">({courseData.courseRatings?.length || 0} ratings)</span>
              {(!courseData.courseRatings || courseData.courseRatings.length === 0) && (
                <span className="text-gray-400 ml-2">No ratings yet</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>{calculateNoOfLectures(courseData)} lectures</span>
              <span>{calculateCourseDuration(courseData)}</span>
            </div>

            <div className="mb-4">
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
              />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  {currency} {(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}
                </span>
                {courseData.discount > 0 && (
                  <span className="text-gray-500 line-through ml-2">
                    {currency} {courseData.coursePrice}
                  </span>
                )}
              </div>
              <button
                onClick={enrollCourse}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetails;
