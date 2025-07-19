import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import CourseCard from '../../components/students/CourseCard';
import SearchBar from '../../components/students/SearchBar';
import Footer from '../../components/students/Footer';
import Loading from '../../components/students/Loading';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const url = backendUrl.replace(/\/$/, '') + '/api/course/get-all-courses';
      const { data } = await axios.get(url);
      
      if (data.success) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      } else {
        console.error('Failed to fetch courses:', data.message);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (input) => {
    setSearchInput(input);
    if (!input.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(course =>
      course.courseTitle.toLowerCase().includes(input.toLowerCase()) ||
      course.educator?.name?.toLowerCase().includes(input.toLowerCase()) ||
      course.courseDescription?.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredCourses(filtered);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">
        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">All Courses</h1>
            <p className="text-gray-500">
              <span
                className="text-blue-600 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Home
              </span>{' '}
              / <span>Courses</span>
            </p>
          </div>
          <SearchBar data={searchInput} onSearch={handleSearch} />
        </div>

        {searchInput && (
          <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 mb-8 text-gray-600">
            <p>{searchInput}</p>
            <img
              src={assets.cross_icon}
              alt=""
              className="cursor-pointer"
              onClick={() => {
                setSearchInput('');
                setFilteredCourses(courses);
              }}
            />
          </div>
        )}

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <img src={assets.search_icon} alt="No courses found" className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {searchInput ? 'Try adjusting your search terms' : 'No courses are currently available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 my-16 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course._id || index} course={course} />
            ))}
          </div>
        )}

        {/* Course Statistics */}
        <div className="bg-gray-50 rounded-lg p-8 mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Course Statistics</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{courses.length}</div>
              <div className="text-gray-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {courses.filter(course => course.educator).length}
              </div>
              <div className="text-gray-600">Active Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {courses.reduce((total, course) => total + (course.courseRatings?.length || 0), 0)}
              </div>
              <div className="text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {courses.reduce((total, course) => {
                  const ratings = course.courseRatings || [];
                  const avgRating = ratings.length > 0 
                    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
                    : 0;
                  return total + avgRating;
                }, 0).toFixed(1)}
              </div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Popular Categories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Programming</h3>
              <p className="text-blue-100 mb-4">
                Learn coding languages and software development
              </p>
              <div className="text-2xl font-bold">
                {courses.filter(course => 
                  course.courseTitle.toLowerCase().includes('programming') ||
                  course.courseTitle.toLowerCase().includes('coding') ||
                  course.courseTitle.toLowerCase().includes('development')
                ).length} Courses
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Design</h3>
              <p className="text-green-100 mb-4">
                Master graphic design and creative skills
              </p>
              <div className="text-2xl font-bold">
                {courses.filter(course => 
                  course.courseTitle.toLowerCase().includes('design') ||
                  course.courseTitle.toLowerCase().includes('graphic') ||
                  course.courseTitle.toLowerCase().includes('creative')
                ).length} Courses
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">Business</h3>
              <p className="text-purple-100 mb-4">
                Develop business and management skills
              </p>
              <div className="text-2xl font-bold">
                {courses.filter(course => 
                  course.courseTitle.toLowerCase().includes('business') ||
                  course.courseTitle.toLowerCase().includes('management') ||
                  course.courseTitle.toLowerCase().includes('marketing')
                ).length} Courses
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Courses; 