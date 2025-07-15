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

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpensections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [PlayerData, setPlayerData] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

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

  const fetchCourseData = async () => {
    try {
      if (!id) {
        toast.error('Course ID is missing');
        return;
      }

      const url = backendUrl.endsWith('/') ? backendUrl + 'api/course/' + id : backendUrl + '/api/course/' + id;
      const { data } = await axios.get(url);

      if (data.success) {
        setCourseData(data.courseData);
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
      
      const url = backendUrl.endsWith('/') ? `${backendUrl}api/user/testimonials/${id}` : `${backendUrl}/api/user/testimonials/${id}`;
      const { data } = await axios.get(url);
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
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
                            src={assets.play_icon}
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

          {/* Testimonials Section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">Student Testimonials</h2>
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
                No testimonials yet. Be the first to share your experience after enrolling!
              </p>
            )}
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
            <img src={courseData.courseThumbnail} alt="" />
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
