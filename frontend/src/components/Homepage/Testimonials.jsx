import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const testimonials = [
  {
    name: 'Adv. Rajesh Sharma',
    title: 'Senior Advocate, Supreme Court of India',
    quote: 'Lawgic has significantly streamlined my legal research. AI-powered case law retrieval saves me hours of manual work.',
    image: 'https://img.freepik.com/free-photo/portrait-young-indian-top-manager-t-shirt-tie-crossed-arms-smiling-white-isolated-wall_496169-1513.jpg',
    rating: 5
  },
  {
    name: 'Priya Mehta',
    title: 'Legal Consultant, Corporate Law',
    image: 'https://img.freepik.com/free-photo/indian-businessman-with-his-white-collar-around-his-neck-against-white-wall_496169-1508.jpg',
    quote: 'The document summarization feature is a game changer! It helps me extract key legal insights in minutes.',
    rating: 5
  },
  {
    name: 'Adv. Anil Verma',
    title: 'High Court Lawyer, Delhi',
    quote: 'AI-based precedent identification is remarkably accurate and has improved my legal arguments immensely.',
    image: 'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
    rating: 4
  },
  {
    name: 'Sneha Iyer',
    title: 'In-House Counsel, Tech Startup',
    quote: 'Legal analytics dashboards provide valuable insights into case trends and judicial decisions. Highly recommended!',
    image: 'https://img.freepik.com/free-photo/indian-businessman-with-his-white-collar-around-his-neck-against-white-wall_496169-1508.jpg',
    rating: 5
  },
  {
    name: 'Adv. Vikram Desai',
    title: 'Criminal Defense Lawyer, Mumbai',
    quote: 'The AI legal analysis tool is exceptionally precise, making case research and strategy planning far more efficient.',
    image: 'https://img.freepik.com/free-photo/handsome-businessman-suit-glasses-cross-arms-chest-look_176420-21750.jpg',
    rating: 5
  },
  {
    name: 'Kunal Bhatia',
    title: 'Law Student, National Law University',
    quote: 'As a student, Lawgic has been an invaluable resource for understanding case law and legal precedents.',
    image: 'https://img.freepik.com/free-photo/young-handsome-man-with-beard-isolated-keeping-arms-crossed-frontal-position_1368-132662.jpg',
    rating: 4
  }
];


const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Preload images
  useEffect(() => {
    const imagePromises = testimonials.map(testimonial => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = testimonial.image;
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    
    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(err => console.error("Failed to load some images", err));
  }, []);
  
  // Auto-rotate testimonials
  useEffect(() => {
    if (!imagesLoaded) return; // Only start rotation after images are loaded
    
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // Get position relative to active index
  const getRelativePosition = (index) => {
    // Calculate the position relative to active index (consider wrapping)
    let position = index - activeIndex;
    
    // Normalize to handle wrapping (if position < -3, wrap to the right side)
    if (position < -Math.floor(testimonials.length / 2)) {
      position += testimonials.length;
    }
    
    // Normalize to handle wrapping (if position > 3, wrap to the left side)
    if (position > Math.floor(testimonials.length / 2)) {
      position -= testimonials.length;
    }
    
    return position;
  };

  // Get card class and style based on position
  const getCardProps = (index) => {
    const position = getRelativePosition(index);
    
    // Base styles for all cards
    let cardClass = "testimonial-card";
    let transform = "translateX(-50%)";
    let zIndex = 10;
    let scale = 1;
    let opacity = 1;
    let leftOffset = "0px";
    
    // Position-specific adjustments
    if (position === 0) {
      // Active card (center)
      cardClass += " card-active";
      zIndex = 30;
    } else if (position === 1) {
      // First card to the right
      cardClass += " card-adjacent";
      leftOffset = "250px";
      scale = 0.85;
      opacity = 0.7;
      zIndex = 20;
    } else if (position === -1) {
      // First card to the left
      cardClass += " card-adjacent";
      leftOffset = "-250px";
      scale = 0.85;
      opacity = 0.7;
      zIndex = 20;
    } else if (position === 2) {
      // Second card to the right
      cardClass += " card-distant";
      leftOffset = "400px";
      scale = 0.7;
      opacity = 0.4;
      zIndex = 10;
    } else if (position === -2) {
      // Second card to the left
      cardClass += " card-distant";
      leftOffset = "-400px";
      scale = 0.7;
      opacity = 0.4;
      zIndex = 10;
    } else {
      // Other cards (more distant)
      cardClass += " card-hidden";
      leftOffset = position > 0 ? "500px" : "-500px";
      scale = 0.6;
      opacity = 0;
      zIndex = 5;
    }

    transform = `translateX(calc(-50% + ${leftOffset})) scale(${scale})`;
    
    return {
      className: cardClass,
      style: {
        transform,
        opacity,
        zIndex
      }
    };
  };

  return (
    <section className="bg-gradient-to-br from-[#f3eee5] via-[#e2dac9] to-[#f0ebdf] py-20 px-6 overflow-hidden">
      <div className="container mx-auto text-center">
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-4 text-[#251c1a]">What Our Customers Say About Us</h2>
          <div className="h-1 w-24 bg-[#b19f84] mx-auto mb-5"></div>
          <p className="text-[#251c1a]/70 max-w-2xl mx-auto">
            We value our customers and their satisfaction is our top priority. Here's what some of them have to say about our services.
          </p>
        </div>

        {!imagesLoaded && (
          <div className="flex justify-center items-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#251c1a]"></div>
          </div>
        )}

        <div className={`relative h-[400px] mx-auto max-w-6xl ${!imagesLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}`}>
          {testimonials.map((testimonial, index) => {
            const cardProps = getCardProps(index);
            
            return (
              <div
                key={index}
                className={cardProps.className}
                style={{
                  ...cardProps.style,
                  transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
                }}
              >
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <img
                      className="w-20 h-20 rounded-full object-cover border-4 border-[#b19f84]"
                      src={testimonial.image}
                      alt={testimonial.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Profile';
                      }}
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#b19f84] rounded-full p-1">
                      <FaQuoteLeft className="text-sm text-white" />
                    </div>
                  </div>
                </div>
                
                <p className="text-lg italic mb-6">"{testimonial.quote}"</p>
                
                <div className="flex justify-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`${i < testimonial.rating ? 'text-[#b19f84]' : 'text-[#251c1a]/20'} ${cardProps.className.includes('card-active') ? 'text-opacity-100' : 'text-opacity-80'}`}
                    />
                  ))}
                </div>
                
                <div className="mt-auto">
                  <h3 className="text-xl font-bold">{testimonial.name}</h3>
                  <p className={`${cardProps.className.includes('card-active') ? 'text-[#e2dac9]' : 'text-[#251c1a]/70'}`}>
                    {testimonial.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                index === activeIndex ? 'bg-[#251c1a]' : 'bg-[#251c1a]/30'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .testimonial-card {
          position: absolute;
          width: 350px;
          height: 380px;
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          top: 0;
          left: 50%;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
          background-color: white;
          color: #251c1a;
        }
        
        .card-active {
          background-color: #251c1a;
          color: white;
          box-shadow: 0px 8px 30px rgba(0, 0, 0, 0.2);
          border: 3px solid #b19f84;
        }
        
        /* Add smooth sliding animation */
        @keyframes slideRight {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideLeft {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default Testimonial;