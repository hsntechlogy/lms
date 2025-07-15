import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/students/Loading';
import Navbar from '../../components/educator/Navbar';
import Sidebar from '../../components/educator/Sidebar';
import Footer from '../../components/educator/Footer';

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, getToken } = useContext(AppContext);
  
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    courseTitle: '',
    courseDescription: '',
    coursePrice: '',
    discount: '',
    courseContent: []
  });

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(
        backendUrl.replace(/\/$/, '') + '/api/course/' + courseId,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setCourseData(data.courseData);
        setFormData({
          courseTitle: data.courseData.courseTitle,
          courseDescription: data.courseData.courseDescription,
          coursePrice: data.courseData.coursePrice,
          discount: data.courseData.discount,
          courseContent: data.courseData.courseContent
        });
        setImagePreview(data.courseData.courseThumbnail);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Allow all image extensions
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP, BMP, TIFF, SVG)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChapterChange = (chapterIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, index) =>
        index === chapterIndex
          ? { ...chapter, [field]: value }
          : chapter
      )
    }));
  };

  const handleLectureChange = (chapterIndex, lectureIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, cIndex) =>
        cIndex === chapterIndex
          ? {
              ...chapter,
              chapterContent: chapter.chapterContent.map((lecture, lIndex) =>
                lIndex === lectureIndex
                  ? { ...lecture, [field]: value }
                  : lecture
              )
            }
          : chapter
      )
    }));
  };

  const addChapter = () => {
    const newChapter = {
      chapterId: `chapter_${Date.now()}`,
      chapterOrder: formData.courseContent.length + 1,
      chapterTitle: '',
      chapterContent: []
    };
    setFormData(prev => ({
      ...prev,
      courseContent: [...prev.courseContent, newChapter]
    }));
  };

  const removeChapter = (chapterIndex) => {
    setFormData(prev => ({
      ...prev,
      courseContent: prev.courseContent.filter((_, index) => index !== chapterIndex)
    }));
  };

  const addLecture = (chapterIndex) => {
    const newLecture = {
      lectureId: `lecture_${Date.now()}`,
      lectureDuration: 0,
      lectureTitle: '',
      lectureUrl: '',
      isPreviewFree: false,
      lectureOrder: formData.courseContent[chapterIndex].chapterContent.length + 1
    };
    
    setFormData(prev => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, index) =>
        index === chapterIndex
          ? { ...chapter, chapterContent: [...chapter.chapterContent, newLecture] }
          : chapter
      )
    }));
  };

  const removeLecture = (chapterIndex, lectureIndex) => {
    setFormData(prev => ({
      ...prev,
      courseContent: prev.courseContent.map((chapter, cIndex) =>
        cIndex === chapterIndex
          ? {
              ...chapter,
              chapterContent: chapter.chapterContent.filter((_, lIndex) => lIndex !== lectureIndex)
            }
          : chapter
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.courseTitle.trim()) {
      return toast.error('Course title is required');
    }
    if (!formData.courseDescription.trim()) {
      return toast.error('Course description is required');
    }
    if (!formData.coursePrice || formData.coursePrice <= 0) {
      return toast.error('Course price must be greater than 0');
    }
    if (formData.discount < 0 || formData.discount > 100) {
      return toast.error('Discount must be between 0 and 100');
    }

    try {
      setLoading(true);
      const token = await getToken();
      
      const submitData = new FormData();
      submitData.append('courseData', JSON.stringify(formData));
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      const { data } = await axios.put(
        backendUrl.replace(/\/$/, '') + '/api/educator/edit-course/' + courseId,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        toast.success('Course updated successfully!');
        navigate('/educator/my-courses');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Edit Course</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Course thumbnail"
                      className="w-32 h-20 object-cover rounded"
                    />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG (Max 5MB)
                </p>
              </div>

              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input
                  type="text"
                  name="courseTitle"
                  value={formData.courseTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description
                </label>
                <textarea
                  name="courseDescription"
                  value={formData.courseDescription}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Course Price and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Price
                  </label>
                  <input
                    type="number"
                    name="coursePrice"
                    value={formData.coursePrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Course Content */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Course Content</h3>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Chapter
                  </button>
                </div>

                {formData.courseContent.map((chapter, chapterIndex) => (
                  <div key={chapterIndex} className="border border-gray-300 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold">Chapter {chapterIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeChapter(chapterIndex)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Remove Chapter
                      </button>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Chapter Title"
                        value={chapter.chapterTitle}
                        onChange={(e) => handleChapterChange(chapterIndex, 'chapterTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex justify-between items-center">
                        <h5 className="font-medium">Lectures</h5>
                        <button
                          type="button"
                          onClick={() => addLecture(chapterIndex)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Add Lecture
                        </button>
                      </div>

                      {chapter.chapterContent.map((lecture, lectureIndex) => (
                        <div key={lectureIndex} className="border border-gray-200 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h6 className="font-medium">Lecture {lectureIndex + 1}</h6>
                            <button
                              type="button"
                              onClick={() => removeLecture(chapterIndex, lectureIndex)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Lecture Title"
                              value={lecture.lectureTitle}
                              onChange={(e) => handleLectureChange(chapterIndex, lectureIndex, 'lectureTitle', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Video URL"
                              value={lecture.lectureUrl}
                              onChange={(e) => handleLectureChange(chapterIndex, lectureIndex, 'lectureUrl', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="number"
                              placeholder="Duration (minutes)"
                              value={lecture.lectureDuration}
                              onChange={(e) => handleLectureChange(chapterIndex, lectureIndex, 'lectureDuration', parseFloat(e.target.value) || 0)}
                              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={lecture.isPreviewFree}
                                onChange={(e) => handleLectureChange(chapterIndex, lectureIndex, 'isPreviewFree', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Free Preview</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/educator/my-courses')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditCourse; 