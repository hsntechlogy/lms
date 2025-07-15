// vite-project/src/pages/educator/MyCourses.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';

const MyCourses = () => {
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const token = await getToken();
      const url = backendUrl.endsWith('/') ? `${backendUrl}api/educator/courses` : `${backendUrl}/api/educator/courses`;
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEducator) {
      fetchCourses();
    }
  }, [isEducator]);

  const handleEdit = (courseId) => {
    navigate(`/educator/edit-course/${courseId}`);
  };

  const handleViewStudents = (courseId) => {
    navigate(`/educator/student-enrolled?courseId=${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Courses</h1>
        <button
          onClick={() => navigate('/educator/add-course')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">You haven't created any courses yet.</p>
          <button
            onClick={() => navigate('/educator/add-course')}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
          >
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              <img
                src={course.courseThumbnail || assets.course_1}
                alt={course.courseTitle}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = assets.course_1;
                }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.courseTitle}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {course.courseDescription.replace(/<[^>]*>/g, '').slice(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-blue-600">
                    ${(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
                  </span>
                  {course.discount > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      ${course.coursePrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                  <span>{course.courseContent?.length || 0} chapters</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(course._id)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewStudents(course._id)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    View Students
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
