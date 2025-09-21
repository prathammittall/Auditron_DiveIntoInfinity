import React from "react";
import { motion } from "framer-motion";
import {
  FaBalanceScale,
  FaSearch,
  FaFileAlt,
  FaChartLine,
  FaUserTie,
  FaRegLightbulb,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const services = [
    {
      title: "Upload & Analyze Instantly",
      description:
        "Drag and drop your PDF documents for immediate analysis. Get a structured overview of key sections, terms, and conditions.",
      icon: <FaFileAlt className="text-4xl mb-4 text-[#f3eee5]/80" />,
      features: [
        "Quick document upload",
        "Structured overview",
        "Key terms extraction",
      ],
    },
    {
      title: "Chat With Documents",
      description:
        "Ask natural language questions and get instant answers. Extract specific clauses and generate easy-to-understand summaries.",
      icon: <FaSearch className="text-4xl mb-4 text-[#f3eee5]/80" />,
      features: [
        "Natural language queries",
        "Clause extraction",
        "Smart summaries",
      ],
    },
    {
      title: "Actionable Insights",
      description:
        "View interactive charts and visualizations that help you understand document patterns, trends, and relationships.",
      icon: <FaChartLine className="text-4xl mb-4 text-[#f3eee5]/80" />,
      features: [
        "Data visualization",
        "Pattern analysis",
        "Trend identification",
      ],
    },
    {
      title: "Clause Analysis",
      description:
        "Deep dive into specific clauses with AI-powered analysis, highlighting important terms and potential concerns.",
      icon: <FaBalanceScale className="text-4xl mb-4 text-[#f3eee5]/80" />,
      features: ["Clause comparison", "Term highlighting", "Risk assessment"],
    },
    {
      title: "Document Comparison",
      description:
        "Compare multiple documents side-by-side to identify differences, similarities, and critical variations.",
      icon: <FaRegLightbulb className="text-4xl mb-4 text-[#f3eee5]/80" />,
      features: [
        "Side-by-side comparison",
        "Change tracking",
        "Version analysis",
      ],
    },
    {
      title: "Secure Processing",
      description:
        "Your documents are processed securely with enterprise-grade encryption and privacy protection.",
      icon: <FaUserTie className="text-4xl mb-4 text-[#f3eee5]/80" />,
      features: ["Enterprise encryption", "Data privacy", "Secure access"],
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

  const handleSearchNowClick = () => {
    // Navigate to dashboard if logged in, or signup page if not
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  };

  return (
    <section className="bg-[#251c1a] text-[#f3eee5] py-20 px-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#f3eee5]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#f3eee5]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="bg-[#f3eee5]/10 text-[#f3eee5] px-4 py-1.5 rounded-full text-sm font-medium inline-block mb-5">
            Key Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            How Auditron Works
          </h2>
          <p className="text-lg text-[#f3eee5]/80 max-w-3xl mx-auto leading-relaxed">
            Transform your document analysis workflow with our powerful AI
            tools. Upload, analyze, and extract insights from your PDFs in
            minutes.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gradient-to-br from-[#f3eee5]/10 to-transparent backdrop-blur-sm p-8 rounded-2xl border border-[#f3eee5]/10 group hover:border-[#f3eee5]/30 transition-all duration-300"
              whileHover={{
                y: -8,
                boxShadow: "0 20px 30px -10px rgba(0,0,0,0.2)",
                transition: { duration: 0.3 },
              }}
            >
              <div className="h-16 w-16 rounded-2xl bg-[#f3eee5]/10 flex items-center justify-center mb-6 group-hover:bg-[#f3eee5]/20 transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-4 group-hover:text-[#f3eee5] transition-colors">
                {service.title}
              </h3>
              <p className="text-[#f3eee5]/70 mb-6 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center text-sm text-[#f3eee5]/60"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f3eee5]/40 mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              {/* Removed "Learn more" section */}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-16 text-center"
        >
          <button
            onClick={handleSearchNowClick}
            className="inline-block bg-[#f3eee5] text-[#251c1a] px-8 py-4 rounded-lg font-semibold hover:bg-[#f3eee5]/90 transition-colors duration-300"
          >
            Try Auditron Free
          </button>
          <p className="text-[#f3eee5]/60 mt-4 text-sm">
            Start analyzing your documents in minutes with our powerful AI
            platform
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;