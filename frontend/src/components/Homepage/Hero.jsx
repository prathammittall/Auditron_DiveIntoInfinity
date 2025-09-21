import React, { useEffect, useState, useRef } from "react";
import { FaGavel, FaRobot } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

function Hero() {
  const [isBalanced, setIsBalanced] = useState(true);
  const balanceRef = useRef(null);
  const { currentUser } = useAuth();

  // Animation for the balance scale
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBalanced((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center py-8"
      style={{ backgroundColor: "#f3eee5" }}
    >
      <div className="container mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left side with increased margin */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 lg:ml-6 pt-20 sm:pt-24 md:pt-16 lg:pt-0">
            {/* Subtle gradient backgrounds */}
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[#b19f84]/5 blur-3xl"></div>

            {/* Reduced size heading */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="relative"
              >
                <div className="relative">
                  <h1 className="text-[#251c1a] text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight relative">
                    <span className="inline-block relative text-[1.3em]">
                      <span>A</span>
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="absolute bottom-2 left-0 h-1.5 bg-[#b19f84]"
                      ></motion.span>
                    </span>
                    <span className="inline-block relative">uditron</span>
                  </h1>
                </div>

                {/* Enhanced tagline with a more stylized look */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-[#251c1a] mt-5 flex flex-col sm:flex-row items-center sm:gap-4"
                >
                  <div className="flex items-center relative">
                    <span className="font-serif italic text-xl sm:text-2xl pr-1 relative">
                      Smart
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b19f84]/60"></span>
                    </span>
                    <span className="font-bold text-xl sm:text-2xl text-[#251c1a]/90 pl-1">
                      Analysis
                    </span>
                  </div>

                  <span className="hidden sm:block">
                    <div className="h-5 w-0.5 bg-[#251c1a]/30 transform rotate-12 mx-1"></div>
                  </span>

                  <div className="flex items-center relative">
                    <span className="font-serif italic text-xl sm:text-2xl pr-1 relative">
                      Instant
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#b19f84]/60"></span>
                    </span>
                    <span className="font-bold text-xl sm:text-2xl text-[#251c1a]/90 pl-1">
                      Insights
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mb-12 relative max-w-lg"
            >
              <div className="relative">
                <span className="absolute -left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#251c1a] to-transparent hidden lg:block"></span>
                <p className="text-[#251c1a]/70 text-lg md:text-xl leading-relaxed">
                  Your AI-powered assistant for analyzing PDFs, extracting
                  critical clauses, and generating instant insights. Chat with
                  your documents, uncover what matters, and make smarter
                  decisions faster.
                </p>
              </div>
            </motion.div>

            {/* CTA button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="w-full max-w-md mx-auto lg:mx-0"
            >
              <Link
                to={currentUser ? "/dashboard" : "/signup"}
                className="relative group inline-flex items-center"
              >
                <span className="absolute inset-0 rounded-full bg-[#251c1a] transform group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-xl"></span>
                <span className="relative flex items-center justify-center gap-3 text-[#f3eee5] font-medium py-4 px-7 rounded-full border border-[#f3eee5]/20">
                  <FaRobot className="text-xl" />
                  <span className="text-lg">Try Auditron Today</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </Link>

              {!currentUser && (
                <div className="mt-4 text-center lg:text-left">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-[#251c1a]/70 hover:text-[#251c1a] transition-colors duration-300"
                  >
                    Already have an account?{" "}
                    <span className="underline">Sign in</span>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right side with balance scale - shifted up */}
          <div className="lg:col-span-6 flex justify-center items-center lg:mt-0 lg:translate-x-6 lg:translate-y-2">
            <div
              ref={balanceRef}
              className="relative w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px]"
            >
              {/* Balance scale component contents remain unchanged */}
              {/* Background circle */}
              <div className="absolute w-[250px] h-[250px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] rounded-full border-8 border-[#251c1a]/10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>

              {/* Central pole */}
              <div className="absolute left-1/2 top-[15%] h-[70%] w-4 sm:w-6 bg-[#251c1a] rounded-t-full transform -translate-x-1/2">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#251c1a] flex items-center justify-center">
                  <FaGavel className="text-[#f3eee5] text-lg sm:text-xl" />
                </div>

                <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-[#251c1a]/20 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-30"></div>
              </div>

              {/* The balance beam */}
              <div
                className={`absolute top-[30%] left-1/2 w-[220px] sm:w-[320px] md:w-[360px] h-4 sm:h-6 bg-gradient-to-r from-[#251c1a] via-[#3a2e2b] to-[#251c1a] rounded-full transform -translate-x-1/2 origin-center transition-transform duration-1000 ${
                  isBalanced ? "rotate-0" : "rotate-[5deg]"
                }`}
              >
                {/* Left scale plate */}
                <div
                  className={`absolute left-0 -bottom-[110px] sm:-bottom-[150px] w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] rounded-full border-6 sm:border-8 border-[#251c1a] transition-transform duration-1000 ${
                    !isBalanced ? "transform -translate-y-4" : ""
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-[#251c1a]/5 backdrop-blur-sm"></div>

                  {/* Law symbol */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-[#251c1a] text-2xl sm:text-3xl font-bold">
                      DATA
                    </div>
                    <div className="text-xs text-[#251c1a]/70 mt-1">
                      Extract
                    </div>
                  </div>
                </div>

                {/* Right scale plate */}
                <div
                  className={`absolute right-0 -bottom-[110px] sm:-bottom-[150px] w-[90px] h-[90px] sm:w-[130px] sm:h-[130px] rounded-full border-6 sm:border-8 border-[#251c1a] transition-transform duration-1000 ${
                    isBalanced ? "transform -translate-y-4" : ""
                  }`}
                >
                  <div className="absolute inset-0 rounded-full bg-[#251c1a]/5 backdrop-blur-sm"></div>

                  {/* Logic symbol */}
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <div className="text-[#251c1a] text-2xl sm:text-3xl font-bold">
                      INTEL
                    </div>
                    <div className="text-xs text-[#251c1a]/70 mt-1">
                      Insight
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative patterns */}
              <svg
                className="absolute top-0 right-0 w-18 h-18 sm:w-24 sm:h-24 text-[#251c1a]/10"
                viewBox="0 0 100 100"
              >
                <path fill="currentColor" d="M0,0 L100,0 L100,100 Z" />
              </svg>
              <svg
                className="absolute bottom-0 left-0 w-18 h-18 sm:w-24 sm:h-24 text-[#251c1a]/10"
                viewBox="0 0 100 100"
              >
                <path fill="currentColor" d="M0,100 L0,0 L100,100 Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;