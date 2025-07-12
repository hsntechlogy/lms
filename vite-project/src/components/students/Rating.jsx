import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const Rating = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating || 0);

  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  useEffect(() => {
    if (initialRating) setRating(initialRating);
  }, [initialRating]);

  return (
    <div className="">
      {Array.from({ length: 5 }, (_, index) => {
        const StarValue = index + 1;
        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer tracking-colors ${
              StarValue <= rating ? 'text-yellow-500' : 'text-gray-400'
            }`}
            onClick={() => handleRating(StarValue)}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
