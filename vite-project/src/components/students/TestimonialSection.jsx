import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { backendUrl } = useContext(AppContext);

  const fetchAllTestimonials = async () => {
    try {
      setLoading(true);
      const url = backendUrl.endsWith('/') ? `${backendUrl}api/course/all` : `${backendUrl}/api/course/all`;
      const { data } = await axios.get(url);
      
      if (data.success) {
        // Collect all testimonials from all courses
        const allTestimonials = data.course.reduce((acc, course) => {
          if (course.testimonials && course.testimonials.length > 0) {
            return [...acc, ...course.testimonials];
          }
          return acc;
        }, []);
        
        // Sort by date (newest first) and take the first 6
        const sortedTestimonials = allTestimonials
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 6);
        
        setTestimonials(sortedTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback to dummy testimonials if API fails
      setTestimonials([
        {
          name: 'Donald Jackman',
          role: 'SWE 1 @ Amazon',
          image: assets.profile_img_1,
          rating: 5,
          feedback: 'I\'ve been using this platform for nearly two years, and it has been incredibly user-friendly, making my learning journey much easier.',
        },
        {
          name: 'Richard Nelson',
          role: 'SWE 2 @ Samsung',
          image: assets.profile_img_2,
          rating: 4,
          feedback: 'The courses are well-structured and the instructors are knowledgeable. Highly recommended for anyone looking to improve their skills.',
        },
        {
          name: 'James Washington',
          role: 'SWE 2 @ Google',
          image: assets.profile_img_3,
          rating: 5,
          feedback: 'Excellent learning platform with practical, real-world projects. The community support is amazing.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTestimonials();
  }, []);

  if (loading) {
    return (
      <div className="pb-14 px-8 md:px-0">
        <h2 className="text-3xl text-center font-medium text-gray-800">Testimonials</h2>
        <p className="md:text-base text-center text-gray-500 mt-3">
          Hear from our learners as they share their journey of transformation,
          success and how our <br /> platform has made a difference in their lives
        </p>
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-14 px-8 md:px-0">
      <h2 className="text-3xl text-center font-medium text-gray-800">Testimonials</h2>
      <p className="md:text-base text-center text-gray-500 mt-3">
        Hear from our learners as they share their journey of transformation,
        success and how our <br /> platform has made a difference in their lives
      </p>
      <div className="grid gap-8 mt-14"
           style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {testimonials.map((testimonial, index) => (
          <div key={index} className="text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow shadow-black/5 overflow-hidden">
            <div className="flex items-center gap-4 px-5 border-b border-gray-500/10 py-4 bg-gray-500/20">
              <img 
                className="h-12 w-12 rounded-full" 
                src={testimonial.userImage || testimonial.image} 
                alt={testimonial.userName || testimonial.name}
                onError={(e) => {
                  e.target.src = assets.profile_img_1;
                }}
              />
              <div>
                <h1 className="text-lg font-medium text-gray-800">{testimonial.userName || testimonial.name}</h1>
                <p className="text-gray-800/80">{testimonial.role || 'Student'}</p>
              </div>
            </div>
            <div className="p-5 pb-7">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <img
                    className="h-5"
                    key={i}
                    src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank}
                    alt=""
                  />
                ))}
              </div>
              <p className="text-gray-500 mt-5">{testimonial.comment || testimonial.feedback}</p>
            </div>
            {testimonial.createdAt && (
              <p className="text-xs text-gray-400 px-5 pb-2">
                {new Date(testimonial.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
