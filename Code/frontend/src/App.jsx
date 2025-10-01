import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard";
import DocumentAnalyzer from "./components/DocumentAnalyzer";
import Footer from "./components/Footer";
import Signup from "./components/pages/signup";
import "./App.css";
import Login from "./components/pages/login";

// Component to conditionally render Navbar
function ConditionalNavbar() {
  const location = useLocation();
  const hideNavbarRoutes = ["/dashboard/analyzer"];

  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  return <Navbar />;
}

// Component to conditionally render main content with padding
function MainContent() {
  const location = useLocation();
  const noTopPaddingRoutes = ["/dashboard/analyzer"];

  const shouldHaveTopPadding = !noTopPaddingRoutes.includes(location.pathname);

  return (
    <main className={`flex-1 ${shouldHaveTopPadding ? "pt-16" : ""}`}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/analyzer" element={<DocumentAnalyzer />} />
        <Route path="/about" element={<HomePage />} />
        <Route path="/services" element={<HomePage />} />
        <Route path="/faq" element={<HomePage />} />
        <Route path="/contact" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-[#251c1a] mb-4">404</h1>
                <p className="text-xl text-[#251c1a]/70 mb-8">Page not found</p>
                <a
                  href="/"
                  className="inline-block bg-[#251c1a] text-[#f3eee5] px-6 py-3 rounded-lg hover:bg-[#251c1a]/90 transition-colors"
                >
                  Return Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#f3eee5] to-[#e2dac9] overflow-x-hidden">
          {/* Conditional Navbar */}
          <ConditionalNavbar />

          {/* Main Content */}
          <MainContent />

          {/* Footer - Only show on homepage */}
          <Routes>
            <Route path="/" element={<Footer />} />
            <Route path="/about" element={<Footer />} />
            <Route path="/services" element={<Footer />} />
            <Route path="/faq" element={<Footer />} />
            <Route path="/contact" element={<Footer />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
