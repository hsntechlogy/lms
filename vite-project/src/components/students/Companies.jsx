import React, { useEffect, useRef, useState } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Continuous auto-scroll
  useEffect(() => {
    const carousel = carouselRef.current;
    let frame;
    let lastTime = performance.now();
    function animate(time) {
      if (!isDragging && carousel) {
        const delta = (time - lastTime) * 0.08; // speed
        carousel.scrollLeft += delta;
        if (carousel.scrollLeft >= carousel.scrollWidth / 2) {
          carousel.scrollLeft = 0;
        }
      }
      lastTime = time;
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isDragging]);

  // Touch/drag to scroll
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  // Touch events for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };
  const handleTouchEnd = () => setIsDragging(false);

  // Duplicate logos for seamless loop
  const logos = [...companyLogos, ...companyLogos, ...companyLogos];

  return (
    <div className="pt-16">
      <p className='text-base text-gray-500 mb-4'>Trusted by</p>
      <div className='overflow-hidden w-full md:px-0 px-2'>
        <div
          ref={carouselRef}
          className='carousel-track gap-6 md:gap-16 flex items-center md:mt-10 mt-5 select-none'
          style={{cursor: isDragging ? 'grabbing' : 'grab', overflowX: 'auto', scrollBehavior: 'smooth'}}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {logos.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className='w-20 md:w-28 flex-shrink-0'
              style={{marginRight: i === logos.length - 1 ? 0 : undefined}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default Companies;