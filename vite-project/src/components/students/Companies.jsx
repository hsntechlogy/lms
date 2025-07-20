import React, { useEffect, useRef } from 'react';
import { assets } from '../../assets/assets';

const companyLogos = [
  { src: assets.microsoft_logo, alt: 'Microsoft' },
  { src: assets.walmart_logo, alt: 'Walmart' },
  { src: assets.accenture_logo, alt: 'Accenture' },
  { src: assets.adobe_logo, alt: 'Adobe' },
  { src: assets.paypal_logo, alt: 'Paypal' },
];

const Companies = () => {
  const carouselRef = useRef();

  useEffect(() => {
    // Simple auto-scroll for large screens
    const carousel = carouselRef.current;
    if (!carousel) return;
    let scrollAmount = 0;
    let direction = 1;
    const scrollStep = 1;
    const interval = setInterval(() => {
      if (window.innerWidth >= 768) {
        carousel.scrollLeft += scrollStep * direction;
        scrollAmount += scrollStep * direction;
        if (carousel.scrollLeft + carousel.offsetWidth >= carousel.scrollWidth || carousel.scrollLeft <= 0) {
          direction *= -1;
        }
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pt-16">
      <p className='text-base text-gray-500 mb-4'>Trusted by</p>
      <div
        ref={carouselRef}
        className='flex items-center gap-6 md:gap-16 md:mt-10 mt-5 overflow-x-auto scrollbar-hide md:scrollbar-default md:overflow-x-hidden px-2 md:px-0'
        style={{scrollBehavior:'smooth'}}
      >
        {companyLogos.map((logo, i) => (
          <img
            key={i}
            src={logo.src}
            alt={logo.alt}
            className='w-20 md:w-28 flex-shrink-0'
            style={{marginRight: i === companyLogos.length - 1 ? 0 : undefined}}
          />
        ))}
      </div>
    </div>
  );
}
export default Companies;