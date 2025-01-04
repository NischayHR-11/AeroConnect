document.addEventListener('DOMContentLoaded', function() {
    const slidesContainer = document.querySelector('.slides');
    const slides = document.querySelectorAll('.slides img');
    let currentIndex = 0;
    const totalSlides = slides.length;
    const slideInterval = 5000; // Time per slide in milliseconds (5 seconds)
  
    function changeSlide() {
      // Move to the next slide
      currentIndex = (currentIndex + 1) % totalSlides;
      const offset = -currentIndex * 100; // Calculate the transform offset
  
      slidesContainer.style.transition = 'transform 1s ease'; // Add transition for smooth sliding
      slidesContainer.style.transform = `translateX(${offset}%)`;
    }
  
    // Initially, set up the infinite loop
    setInterval(changeSlide, slideInterval); // Change slides every 5 seconds
  
    // Optionally, add event listeners or other logic for user control (e.g., next/prev buttons)
  });
  