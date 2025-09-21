import React, { useState } from "react";
import {
  FaHome,
  FaInfoCircle,
  FaGavel,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaNewspaper,
  FaLightbulb,
  FaHeadset,
  FaSearch,
  FaFileAlt,
  FaCheck,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Handle navigation with smooth scrolling
  const handleNavClick = (section) => {
    if (location.pathname === "/" && section) {
      // On homepage, scroll to the section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (section) {
      // If not on homepage, navigate to homepage then scroll
      window.location.href = `/?section=${section}`;
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;

    // In a real application, you would send this email to your backend
    // For now, we'll just show a success message
    setSubscriptionMessage(
      "Thank you for subscribing to our legal newsletter! You'll now receive the latest case law updates, legal insights, and platform features."
    );
    setShowSuccessMessage(true);
    setEmail("");

    // Auto-hide the success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <footer className="bg-[#251c1a] text-[#f3eee5] py-12 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#f3eee5] flex items-center justify-center mr-2">
                  <FaGavel className="text-lg text-[#251c1a]" />
                </div>
                Auditron
              </h2>
              <p className="text-[#f3eee5]/80 leading-relaxed">
                Transforming document analysis with AI-powered intelligence,
                automated data extraction, and smart document processing.
              </p>
            </div>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-[#f3eee5]/10 flex items-center justify-center hover:bg-[#f3eee5]/20 transition-all duration-300"
              >
                <FaLinkedin className="text-[#f3eee5]" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-[#f3eee5]/10 flex items-center justify-center hover:bg-[#f3eee5]/20 transition-all duration-300"
              >
                <FaTwitter className="text-[#f3eee5]" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-[#f3eee5]/10 flex items-center justify-center hover:bg-[#f3eee5]/20 transition-all duration-300"
              >
                <FaGithub className="text-[#f3eee5]" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold mb-4 inline-block relative after:content-[''] after:block after:w-1/2 after:h-0.5 after:bg-[#f3eee5]/40 after:mt-1">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="flex items-center space-x-2 group"
                >
                  <span className="h-8 w-8 rounded bg-[#f3eee5]/10 flex items-center justify-center group-hover:bg-[#f3eee5]/20 transition-all duration-300">
                    <FaHome className="text-[#f3eee5]" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={() => handleNavClick("about")}
                  className="flex items-center space-x-2 group"
                >
                  <span className="h-8 w-8 rounded bg-[#f3eee5]/10 flex items-center justify-center group-hover:bg-[#f3eee5]/20 transition-all duration-300">
                    <FaInfoCircle className="text-[#f3eee5]" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    About
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={() => handleNavClick("services")}
                  className="flex items-center space-x-2 group"
                >
                  <span className="h-8 w-8 rounded bg-[#f3eee5]/10 flex items-center justify-center group-hover:bg-[#f3eee5]/20 transition-all duration-300">
                    <FaGavel className="text-[#f3eee5]" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    Services
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  onClick={() => handleNavClick("faq")}
                  className="flex items-center space-x-2 group"
                >
                  <span className="h-8 w-8 rounded bg-[#f3eee5]/10 flex items-center justify-center group-hover:bg-[#f3eee5]/20 transition-all duration-300">
                    <FaGavel className="text-[#f3eee5]" />
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    FAQ
                  </span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold mb-4 inline-block relative after:content-[''] after:block after:w-1/2 after:h-0.5 after:bg-[#f3eee5]/40 after:mt-1">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]"></span>
                <span>AI-Powered Document Analysis</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]"></span>
                <span>Smart Data Extraction</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]"></span>
                <span>Document Processing</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]"></span>
                <span>Pattern Recognition</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]"></span>
                <span>Process Automation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]"></span>
                <span>24/7 Support</span>
              </li>
            </ul>
          </motion.div>

          {/* Contact Us */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-semibold mb-4 inline-block relative after:content-[''] after:block after:w-1/2 after:h-0.5 after:bg-[#f3eee5]/40 after:mt-1">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@auditron.ai"
                  className="flex items-center space-x-3 group"
                >
                  <span className="h-10 w-10 rounded-full bg-[#f3eee5]/10 flex items-center justify-center group-hover:bg-[#f3eee5]/20 transition-all duration-300">
                    <FaEnvelope className="text-[#f3eee5]" />
                  </span>
                  <span className="text-[#f3eee5]/80 group-hover:text-[#f3eee5] transition-colors duration-300">
                    support@auditron.ai
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+1234567890"
                  className="flex items-center space-x-3 group"
                >
                  <span className="h-10 w-10 rounded-full bg-[#f3eee5]/10 flex items-center justify-center group-hover:bg-[#f3eee5]/20 transition-all duration-300">
                    <FaPhoneAlt className="text-[#f3eee5]" />
                  </span>
                  <span className="text-[#f3eee5]/80 group-hover:text-[#f3eee5] transition-colors duration-300">
                    +123 456 7890
                  </span>
                </a>
              </li>
              <li>
                <div className="flex items-center space-x-3">
                  <span className="h-10 w-10 rounded-full bg-[#f3eee5]/10 flex items-center justify-center">
                    <FaMapMarkerAlt className="text-[#f3eee5]" />
                  </span>
                  <span className="text-[#f3eee5]/80">
                    Chitkara University, Punjab 147001
                  </span>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div
          className="mt-12 py-8 px-6 border border-[#f3eee5]/10 rounded-lg bg-[#f3eee5]/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-2">
                Stay Updated with Auditron
              </h3>
              <p className="text-[#f3eee5]/70">
                Subscribe for the latest document processing innovations
              </p>
            </div>
            <div className="w-full md:w-1/2">
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#f3eee5]/10 border border-[#f3eee5]/20 rounded px-4 py-2.5 text-[#f3eee5] focus:outline-none focus:ring-2 focus:ring-[#f3eee5]/30 w-full"
                />
                <button
                  type="submit"
                  className="bg-[#f3eee5] text-[#251c1a] rounded px-6 py-2.5 font-medium hover:bg-[#f3eee5]/90 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
              {showSuccessMessage && (
                <div className="mt-4 text-[#f3eee5]/80">
                  {subscriptionMessage}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-[#f3eee5]/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              className="mb-4 md:mb-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-[#f3eee5]/70 text-sm">
                &copy; {currentYear} Auditron. All rights reserved.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 text-sm text-[#f3eee5]/70"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/terms"
                className="hover:text-[#f3eee5] transition-colors duration-300"
              >
                Terms
              </Link>
              <span className="hidden md:inline">•</span>
              <Link
                to="/privacy"
                className="hover:text-[#f3eee5] transition-colors duration-300"
              >
                Privacy
              </Link>
              <span className="hidden md:inline">•</span>
              <Link
                to="/cookie-policy"
                className="hover:text-[#f3eee5] transition-colors duration-300"
              >
                Cookie Policy
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;