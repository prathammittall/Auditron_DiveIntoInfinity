import React from 'react';
import Hero from './Homepage/Hero';
import About from './Homepage/About';
import Services from './Homepage/Services';
import Testimonials from './Homepage/Testimonials';
import FAQ from './Homepage/FAQ';

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3eee5] to-[#e2dac9]">
      {/* Hero Section */}
      <section id="home">
        <Hero />
      </section>
      
      {/* About Section */}
      <section id="about">
        <About />
      </section>
      
      {/* Services Section */}
      <section id="services">
        <Services />
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials">
        <Testimonials />
      </section>
      
      {/* FAQ Section */}
      <section id="faq">
        <FAQ />
      </section>
    </div>
  );
}

export default HomePage;