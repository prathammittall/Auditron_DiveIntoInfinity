import React from "react";
import {
  FaDatabase,
  FaRobot,
  FaSearch,
  FaUsers,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import CountUp from "react-countup";

const About = () => {
  const stats = [
    {
      icon: <FaDatabase className="text-3xl md:text-4xl text-[#251c1a]" />,
      value: 10000,
      label: "Pages Processed Daily",
      suffix: "+",
    },
    {
      icon: <FaSearch className="text-3xl md:text-4xl text-[#251c1a]" />,
      value: 95,
      label: "Information Extraction Rate",
      suffix: "%",
    },
    {
      icon: <FaRobot className="text-3xl md:text-4xl text-[#251c1a]" />,
      value: 99,
      label: "Text Recognition Accuracy",
      suffix: "%",
    },
    {
      icon: <FaUsers className="text-3xl md:text-4xl text-[#251c1a]" />,
      value: 500,
      label: "Business Partners",
      suffix: "+",
    },
    {
      icon: <FaFileAlt className="text-3xl md:text-4xl text-[#251c1a]" />,
      value: 15,
      label: "Document Types Supported",
      suffix: "+",
    },
    {
      icon: <FaClock className="text-3xl md:text-4xl text-[#251c1a]" />,
      value: 30,
      label: "Average Time Saved",
      suffix: "%",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const hoverVariants = {
    hover: {
      y: -5,
      transition: {
        duration: 0.3,
        yoyo: 5,
      },
    },
  };
  //for mobile
  const formatNumber = (value) => {
    if (window.innerWidth < 640 && value >= 1000000) {
      return (value / 1000000).toFixed(1) + "M";
    } else if (window.innerWidth < 640 && value >= 1000) {
      return (value / 1000).toFixed(0) + "K";
    }
    return value;
  };

  return (
    <section className="bg-[#f3eee5] text-[#251c1a] py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
            Auditron by the Numbers
          </h2>
          <div className="w-24 md:w-32 h-1 md:h-1.5 bg-[#251c1a]/50 mx-auto mb-4 md:mb-6"></div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-[#251c1a]/10 to-transparent p-4 sm:p-6 md:p-8 rounded-2xl border border-[#251c1a]/10 text-center cursor-pointer relative transition-transform duration-300"
            >
              <motion.div variants={hoverVariants}>
                <div className="flex justify-center mb-2 md:mb-4">
                  {stat.icon}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-2xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      formattingFn={(value) => {
                        // Format large numbers for better mobile display
                        if (value >= 1000000) {
                          return (value / 1000000).toFixed(1) + "M";
                        } else if (value >= 1000) {
                          return (value / 1000).toFixed(0) + "K";
                        }
                        return value;
                      }}
                      suffix={stat.suffix}
                    />
                  </h3>
                </div>
                <p className="text-sm sm:text-md md:text-lg text-[#251c1a]/80">
                  {stat.label}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;