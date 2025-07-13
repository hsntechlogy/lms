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

  const {
    allCourses,
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

  // Function to check if text contains only English characters
  const isEnglishOnly = (text) => {
    const englishRegex = /^[a-zA-Z0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|<>\/\n\r]*$/;
    return englishRegex.test(text);
  };

  // Function to get course progress
  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/get-course-progress',
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setProgressData(data.progressData);
      } else {
        console.log('Progress fetch failed:', data.message);
      }
    } catch (error) {
      console.log('Progress fetch error:', error.message);
    }
  };

  // Function to mark lecture as completed
  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/update-course-progress',
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
        backendUrl + '/api/user/update-course-progress',
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

      const { data } = await axios.get(backendUrl + '/api/course/' + id);

      if (data.success) {
        setCourseData(data.courseData);
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

  const fetchTestimonials = async () => {
    try {
      if (!id) return;
      
      const { data } = await axios.get(`${backendUrl}/api/user/testimonials/${id}`);
      if (data.success) {
        setTestimonials(data.testimonials);
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
        backendUrl + '/api/user/add-rating',
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
        `${backendUrl}/api/user/add-testimonial`,
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

      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/purchase',
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
      {/* JSX remains unchanged */}
      {/* ...your full JSX content goes here... */}
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/* Left column */}
        <div>
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>

          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 200),
            }}
          ></p>

          {/* Review and rating */}
          <div className="flex items-center space-x-2 pb-1 pt-3 text-sm">
            <p>{CalculateRating(courseData)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={
                    i < Math.floor(CalculateRating(courseData))
                      ? assets.star
                      : assets.star_blank
                  }
                  alt=""
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.courseRatings.length}{' '}
              {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})
            </p>
            <p>
              {courseData.courseRatings.length}{' '}
              {courseData.courseRatings.length > 1 ? 'students' : 'student'}
            </p>
          </div>

          <p className="text-sm">
            Course by <span className="text-blue-600 underline">{courseData.educator.name}</span>
          </p>

          {/* Course structure */}
          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
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
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures -{' '}
                      {calculateChapterTime(chapter)}
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
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: lecture.lectureUrl.split('/').pop(),
                                    })
                                  }
                                  className="text-blue-500 cursor-pointer hover:text-blue-700"
                                >
                                  Preview
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
          </div>

          {/* Rating Section - Only show if enrolled */}
          {isAlreadyEnrolled && (
            <div className="flex items-center gap-2 py-3 mt-10">
              <h1 className="text-xl font-bold">Rate this course</h1>
              <Rating initialRating={initialRating} onRate={handleRate} />
            </div>
          )}

          {/* Interactive Testimonials Section - Only show if enrolled */}
          {isAlreadyEnrolled && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Testimonials</h2>
              
              {canAddTestimonial() && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowTestimonialForm(!showTestimonialForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  >
                    {showTestimonialForm ? 'Cancel' : 'Add Testimonial'}
                  </button>
                  
                  {showTestimonialForm && (
                    <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
                      <textarea
                        value={testimonialComment}
                        onChange={(e) => setTestimonialComment(e.target.value)}
                        placeholder="Share your experience with this course in English only (10-500 characters)..."
                        className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        maxLength="500"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">
                          {testimonialComment.length}/500 characters
                          {!isEnglishOnly(testimonialComment) && testimonialComment.length > 0 && (
                            <span className="text-red-500 ml-2">English only</span>
                          )}
                        </span>
                        <button
                          onClick={handleAddTestimonial}
                          disabled={!isEnglishOnly(testimonialComment) || testimonialComment.length < 10}
                          className={`px-4 py-2 rounded transition-colors ${
                            isEnglishOnly(testimonialComment) && testimonialComment.length >= 10
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          Submit Testimonial
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Display Testimonials */}
              {testimonials && testimonials.length > 0 ? (
                <div className="space-y-4">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="border border-gray-300 rounded p-4 bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={testimonial.userImage || assets.profile_img_1}
                          alt={testimonial.userName}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            e.target.src = assets.profile_img_1;
                          }}
                        />
                        <div>
                          <h4 className="font-semibold">{testimonial.userName}</h4>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < testimonial.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{testimonial.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(testimonial.createdAt).toLocaleDateString()}
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
          )}

          {/* Full description */}
          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
            ></p>
          </div>
        </div>

        {/* Right column */}
        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {PlayerData ? (
            <Youtube
              videoId={PlayerData.videoId}
              opts={{ playerVars: { autoplay: 1 } }}
              iframeClassName="w-full aspect-video"
            />
          ) : (
            <img src={courseData.courseThumbnail} alt="" />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img
                className="w-3.5"
                src={assets.time_left_clock_icon}
                alt="time left clock icon"
              />
              <p className="text-red-500">
                <span className="font-medium">5 days </span>left at this price!
              </p>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">{courseData.discount}% off</p>
            </div>

            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="" />
                <p>{CalculateRating(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <img src={assets.time_clock_icon} alt="time clock icon" />
              <p>{calculateCourseDuration(courseData)}</p>
            </div>

            <div className="flex items-center gap-2 pt-3 text-gray-500">
              <img src={assets.lesson_icon} alt="lesson icon" />
              <p>{calculateNoOfLectures(courseData)} lessons</p>
            </div>

            <button onClick={enrollCourse} className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium">
              {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
            </button>

            <div className="pt-5">
              <p className="md:text-xl text-lg font-medium text-gray-800">
                What's in the course
              </p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates</li>
                <li>Step by step, hands-on project guidance</li>
                <li>Downloadable resources and source code</li>
                <li>Quizzes to test your knowledge</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CourseDetails;
