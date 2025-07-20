import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { backendUrl, isEducator, userData, getToken } = useContext(AppContext);

  const isAdmin = userData && userData.isAdmin;
  const canSeeAll = isEducator || isAdmin;

  const fetchAllTestimonials = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/course/all`);

      if (data.success && Array.isArray(data.course)) {
        const allTestimonials = data.course.flatMap(course =>
          Array.isArray(course.testimonials) ? course.testimonials : []
        );

        const sortedTestimonials = allTestimonials
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setTestimonials(sortedTestimonials);
      } else {
        throw new Error('Invalid course data');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([
        {
          name: 'Donald Jackman',
          role: 'SWE 1 @ Amazon',
          image: assets.profile_img_1,
          rating: 5,
          feedback: "I've been using this platform for nearly two years, and it has been incredibly user‑friendly.",
        },
        {
          name: 'Richard Nelson',
          role: 'SWE 2 @ Samsung',
          image: assets.profile_img_2,
          rating: 4,
          feedback: 'The courses are well‑structured and the instructors are knowledgeable.',
        },
        {
          name: 'James Washington',
          role: 'SWE 2 @ Google',
          image: assets.profile_img_3,
          rating: 5,
          feedback: 'Excellent learning platform with practical, real‑world projects.',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTestimonials();
  }, []);

  // Delete testimonial handler (for educator)
  const handleDelete = async (testimonial) => {
    if (!isEducator) return;
    try {
      const token = await getToken();
      await axios.post(
        `${backendUrl}/api/educator/delete-testimonial`,
        { testimonialId: testimonial._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimonials(prev => prev.filter(t => t._id !== testimonial._id));
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
    }
  };

  // Determine testimonials to show
  const displayedTestimonials = canSeeAll && showAll ? testimonials : testimonials.slice(0, 3);

  return (
    <div className="pb-14 px-8 md:px-0 relative group">
      <div className="testimonials-circle-bg group-hover:testimonials-circle-float"></div>
      <h2 className="text-4xl md:text-5xl text-center font-extrabold text-gray-800 testimonials-animated-modern">Testimonials</h2>
      <p className="md:text-2xl text-lg text-center font-semibold text-gray-700 mt-4 testimonials-animated-modern">
        Hear from our learners as they share their journey of transformation,
        success and how our <br /> platform has made a difference in their lives
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div
            className="grid gap-8 mt-14 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {displayedTestimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow shadow-black/5 overflow-hidden group"
              >
                <div className="flex items-center gap-4 px-5 border-b border-gray-500/10 py-4 bg-gray-500/20">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.userImage || testimonial.image || assets.profile_img_1}
                    alt={testimonial.userName || testimonial.name || 'Student'}
                    onError={(e) => (e.target.src = assets.profile_img_1)}
                  />
                  <div>
                    <h1 className="text-lg font-medium text-gray-800">
                      {testimonial.userName || testimonial.name || 'Anonymous'}
                    </h1>
                    <p className="text-gray-800/80">{testimonial.role || 'Student'}</p>
                  </div>
                </div>
                <div className="p-5 pb-7">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <img
                        key={i}
                        className="h-5"
                        src={
                          i < Math.floor(testimonial.rating || 0)
                            ? assets.star
                            : assets.star_blank
                        }
                        alt=""
                      />
                    ))}
                  </div>
                  <p className="text-gray-500 mt-5">
                    {testimonial.comment || testimonial.feedback}
                  </p>
                </div>
                {testimonial.createdAt && (
                  <p className="text-xs text-gray-400 px-5 pb-2">
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </p>
                )}
                {/* Delete button for educator on hover */}
                {isEducator && (
                  <button
                    className="absolute top-2 right-2 text-xs text-red-600 border border-red-400 px-2 py-1 rounded bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(testimonial)}
                    title="Delete Comment"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* See All Comments button for educator and admin */}
          {canSeeAll && testimonials.length > 3 && !showAll && (
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-blue-700"
                onClick={() => setShowAll(true)}
              >
                See All Comments
              </button>
            </div>
          )}
          {canSeeAll && showAll && testimonials.length > 3 && (
            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-blue-700"
                onClick={() => setShowAll(false)}
              >
                Show Less
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestimonialsSection;
