import React from 'react';
import { motion } from 'framer-motion';
import logoImage from '../assets/logo_latest.png';

const Loader = ({ fullScreen = true }) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0 bg-[#f3eee5] z-50' : ''}`}>
      <div className="flex flex-col items-center">
        {/* Logo container with simple animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden">
            <img src={logoImage} alt="Lawgic Logo" className="w-20 h-auto" />
          </div>
        </motion.div>
        
        {/* Simple loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-4 text-sm text-[#251c1a]/70 font-medium"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
};

export default Loader;