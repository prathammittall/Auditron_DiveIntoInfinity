import React from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaRobot,
  FaArrowRight,
  FaGavel,
  FaCheckCircle,
  FaShieldAlt,
  FaChartBar,
} from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3eee5] to-[#e2dac9] p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#251c1a] to-[#3a2d2a] rounded-full flex items-center justify-center shadow-lg">
              <FaGavel className="text-[#f3eee5] text-base" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-[#251c1a] mb-1">
            Auditron Dashboard
          </h1>
          <p className="text-[#251c1a]/70 text-sm">AI-Powered Legal Analysis</p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 gap-3 min-h-0">
          {/* Main Column */}
          <div className="space-y-3">
            {/* Document Analyzer - Featured Card */}
            <div className="bg-[#f3eee5]/95 backdrop-blur-sm rounded-lg shadow-lg border border-[#251c1a]/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.005] group">
              <div className="p-4">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#251c1a] to-[#3a2d2a] rounded-lg flex items-center justify-center mr-3 group-hover:rotate-2 transition-transform duration-300">
                      <FaFileAlt className="text-[#f3eee5] text-sm" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#251c1a]">
                        Document Analyzer
                      </h2>
                      <p className="text-[#251c1a]/60 text-xs">
                        AI-Powered Legal Document Analysis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-[#251c1a] font-medium">
                    <FaCheckCircle className="text-green-600 mr-1 text-xs" />
                    <span className="text-xs">Ready</span>
                  </div>
                </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center text-[#251c1a]/80 text-xs">
                  <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
                  <span>Upload & analyze PDFs</span>
                </div>
                <div className="flex items-center text-[#251c1a]/80 text-xs">
                  <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
                  <span>AI-powered insights</span>
                </div>
                <div className="flex items-center text-[#251c1a]/80 text-xs">
                  <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
                  <span>Ask document questions</span>
                </div>
                <div className="flex items-center text-[#251c1a]/80 text-xs">
                  <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
                  <span>Extract key information</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/dashboard/analyzer"
                className="w-full bg-gradient-to-r from-[#251c1a] to-[#3a2d2a] hover:from-[#3a2d2a] hover:to-[#4d3a37] text-[#f3eee5] font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center group-hover:shadow-lg text-sm"
              >
                <span className="mr-2">Open Document Analyzer</span>
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1 text-xs" />
              </Link>
            </div>

            {/* Card Footer */}
            <div className="bg-gradient-to-r from-[#e2dac9]/50 to-[#d4c5b0]/50 px-4 py-2 border-t border-[#251c1a]/10 rounded-b-lg">
              <span className="text-[#251c1a]/60 text-xs">
                Supports PDF documents up to 50MB
              </span>
            </div>
          </div>

{/* Compliance Agent Card */}
<div className="bg-[#f3eee5]/95 backdrop-blur-sm rounded-lg shadow-lg border border-[#251c1a]/10 hover:shadow-xl transition-all duration-300 hover:scale-[1.005] group">
  <div className="p-4">
    {/* Card Header */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-[#251c1a] to-[#3a2d2a] rounded-lg flex items-center justify-center mr-3 group-hover:rotate-2 transition-transform duration-300">
          <FaShieldAlt className="text-[#f3eee5] text-sm" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#251c1a]">
            Compliance Agent
          </h2>
          <p className="text-[#251c1a]/60 text-xs">
            AI-Powered Compliance Auditor
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <a href="https://local-mocha.vercel.app/" className="text-xs px-2 py-1 rounded bg-[#251c1a] text-white font-medium">Open</a>
      </div>
    </div>

    {/* Features */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="flex items-center text-[#251c1a]/80 text-xs">
        <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
        <span>Risk Detection</span>
      </div>
      <div className="flex items-center text-[#251c1a]/80 text-xs">
        <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
        <span>Compliance Benchmarking</span>
      </div>
      <div className="flex items-center text-[#251c1a]/80 text-xs">
        <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
        <span>Gap Identification</span>
      </div>
      <div className="flex items-center text-[#251c1a]/80 text-xs">
        <div className="w-1 h-1 bg-[#251c1a] rounded-full mr-2"></div>
        <span>Financial Exposure Analysis</span>
      </div>
    </div>

    {/* Info Section */}
    <div className="bg-[#251c1a]/5 rounded-lg p-3 mb-3">
      <div className="flex items-center mb-2">
        <FaChartBar className="text-[#251c1a]/60 mr-2 text-sm" />
        <span className="text-[#251c1a] text-sm font-medium">Supported Standards</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-white px-2 py-1 rounded text-[#251c1a]/70">IRDAI</span>
        <span className="text-xs bg-white px-2 py-1 rounded text-[#251c1a]/70">HIPAA</span>
        <span className="text-xs bg-white px-2 py-1 rounded text-[#251c1a]/70">GDPR</span>
        <span className="text-xs bg-white px-2 py-1 rounded text-[#251c1a]/70">ISO</span>
        <span className="text-xs bg-white px-2 py-1 rounded text-[#251c1a]/70">SOC 2</span>
      </div>
    </div>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
