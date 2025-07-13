import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const Rating = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  const handleMouseEnter = (value) => {
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  useEffect(() => {
    if (initialRating) setRating(initialRating);
  }, [initialRating]);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const displayRating = hoverRating || rating;
        
        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors duration-200 ${
              starValue <= displayRating ? 'text-yellow-500' : 'text-gray-300'
            } hover:text-yellow-400`}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            ★
          </span>
        );
      })}
      {rating > 0 && (
        <span className="text-sm text-gray-600 ml-2">
          ({rating}/5)
        </span>
      )}
    </div>
  );
};

export default Rating;
