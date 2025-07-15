import React, { useRef, useState, useEffect, useContext } from 'react';
import uniqid from 'uniqid';
import Quill from 'quill';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const { backendUrl, getToken, fetchAllCourses } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter chapter name:');
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter((chapter) => chapter.chapterId !== chapterId));
    } else if (action === 'toggle') {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          };
          chapter.chapterContent.push(newLecture);
        }
        return chapter;
      })
    );
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      if (!image) {
        toast.error('Thumbnail Not Selected');
        return;
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);

      const token = await getToken();
      const { data } = await axios.post(
        backendUrl.replace(/\/$/, '') + '/api/educator/add-course',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        
        // Reset form
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = '';
        
        // Refresh courses data
        await fetchAllCourses();
        
        // Navigate to my courses
        navigate('/educator/my-courses');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, []);

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Add New Course</h1>
          <button
            type="button"
            onClick={() => navigate('/educator/my-courses')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>

        {/* Course Title */}
        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input
            onChange={(e) => setCourseTitle(e.target.value)}
            value={courseTitle}
            type='text'
            placeholder='Type here'
            className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500'
            required
          />
        </div>

        {/* Description */}
        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={editorRef}></div>
        </div>

        {/* Price + Thumbnail */}
        <div className='flex items-center justify-between flex-wrap gap-4'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input
              onChange={(e) => setCoursePrice(e.target.value)}
              value={coursePrice}
              type='number'
              placeholder='0'
              className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
              required
            />
          </div>
          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbImage' className='flex items-center gap-3'>
              <img src={assets.file_upload_icon} className='p-3 bg-blue-500 rounded' />
              <input
                type='file'
                id='thumbImage'
                onChange={(e) => setImage(e.target.files[0])}
                accept='image/*'
                hidden
              />
              <img className='max-h-10' src={image ? URL.createObjectURL(image) : ''} alt='' />
            </label>
          </div>
        </div>

        {/* Discount */}
        <div className='flex flex-col gap-1'>
          <p>Discount %</p>
          <input
            onChange={(e) => setDiscount(e.target.value)}
            value={discount}
            type='number'
            placeholder='0'
            min={0}
            max={100}
            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-500'
            required
          />
        </div>

        {/* Chapters */}
        <div className='flex flex-col gap-2'>
          <p>Chapters</p>
          {chapters.map((chapter, index) => (
            <div key={chapter.chapterId} className='border border-gray-300 rounded'>
              <div
                className='flex items-center justify-between px-4 py-3 cursor-pointer'
                onClick={() => handleChapter('toggle', chapter.chapterId)}
              >
                <div className='flex items-center gap-2'>
                  <img
                    className={`transform transition-transform ${
                      chapter.collapsed ? '' : 'rotate-180'
                    }`}
                    src={assets.down_arrow_icon}
                    alt='arrow icon'
                  />
                  <p className='font-medium'>{chapter.chapterTitle}</p>
                </div>
                <img
                  src={assets.cross_icon}
                  className='cursor-pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChapter('remove', chapter.chapterId);
                  }}
                />
              </div>

              {!chapter.collapsed && (
                <div className='p-4'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lecture.lectureId} className='flex justify-between items-center mb-2'>
                      <span>
                        {lectureIndex + 1}. {lecture.lectureTitle} - {lecture.lectureDuration} mins -{' '}
                        <a href={lecture.lectureUrl} target='_blank' className='text-blue-500'>
                          Link
                        </a>{' '}
                        - {lecture.isPreviewFree ? 'Free Preview' : 'Paid'}
                      </span>
                    </div>
                  ))}

                  <div
                    className='inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2'
                    onClick={() => {
                      setCurrentChapterId(chapter.chapterId);
                      setShowPopup(true);
                    }}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer'
          onClick={() => handleChapter('add')}
        >
          + Add Chapter
        </div>

        <button 
          type='submit' 
          disabled={submitting}
          className={`w-max py-2.5 px-8 rounded my-4 ${
            submitting 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {submitting ? 'Adding...' : 'ADD COURSE'}
        </button>
      </form>

      {/* Popup */}
      {showPopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='bg-white text-gray-700 p-4 rounded relative w-full max-w-80'>
            <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>

            <div className='mb-2'>
              <p>Lecture Title</p>
              <input
                type='text'
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureTitle}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
                }
              />
            </div>

            <div className='mb-2'>
              <p>Lecture Duration</p>
              <input
                type='text'
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureDuration}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
                }
              />
            </div>

            <div className='mb-2'>
              <p>Lecture URL</p>
              <input
                type='text'
                className='mt-1 block w-full border rounded py-1 px-2'
                value={lectureDetails.lectureUrl}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, lectureUrl: e.target.value })
                }
              />
            </div>

            <div className='flex items-center gap-2 my-4'>
              <label>Is Preview Free?</label>
              <input
                type='checkbox'
                className='scale-125'
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                }
              />
            </div>

            <button
              type='button'
              className='w-full bg-blue-500 text-white px-4 py-2 rounded'
              onClick={addLecture}
            >
              Add
            </button>

            <img
              onClick={() => setShowPopup(false)}
              src={assets.cross_icon}
              className='absolute top-4 right-4 w-4 cursor-pointer'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
