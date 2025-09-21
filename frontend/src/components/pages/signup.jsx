
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaUser, FaGoogle, FaGithub, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (errorCode) => {
    switch(errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/operation-not-allowed':
        return 'Account creation is disabled';
      case 'auth/weak-password':
        return 'Password is too weak';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError(error.message || 'Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    try {
      setLoading(true);
      await loginWithGithub();
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub sign-up error:', error);
      setError(error.message || 'Failed to sign up with GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3eee5] to-[#e2dac9] py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#251c1a]">Create Account</h2>
          <p className="mt-2 text-sm text-[#251c1a]/60">Join Lawgic's legal research platform</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <FaExclamationCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium text-[#251c1a]/70 block mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#251c1a]/30">
                  <FaUser />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-[#251c1a]/10 bg-[#f3eee5]/30 py-3 pl-10 pr-3 placeholder-[#251c1a]/30 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/30 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-[#251c1a]/70 block mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#251c1a]/30">
                  <FaEnvelope />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-[#251c1a]/10 bg-[#f3eee5]/30 py-3 pl-10 pr-3 placeholder-[#251c1a]/30 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/30 focus:border-transparent"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-[#251c1a]/70 block mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#251c1a]/30">
                  <FaLock />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-[#251c1a]/10 bg-[#f3eee5]/30 py-3 pl-10 pr-3 placeholder-[#251c1a]/30 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/30 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#251c1a]/70 block mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 text-[#251c1a]/30">
                  <FaLock />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-lg border border-[#251c1a]/10 bg-[#f3eee5]/30 py-3 pl-10 pr-3 placeholder-[#251c1a]/30 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/30 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#251c1a] text-white font-medium hover:bg-[#251c1a]/90 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/50 focus:ring-offset-2 transition-colors disabled:bg-[#251c1a]/50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#251c1a]/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[#251c1a]/60">or continue with</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg border border-[#251c1a]/10 bg-white text-[#251c1a] font-medium hover:bg-[#f3eee5]/30 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/30 transition-colors"
            >
              <FaGoogle className="mr-2" />
              Google
            </button>
            <button
              type="button"
              onClick={handleGithubSignUp}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg border border-[#251c1a]/10 bg-white text-[#251c1a] font-medium hover:bg-[#f3eee5]/30 focus:outline-none focus:ring-2 focus:ring-[#251c1a]/30 transition-colors"
            >
              <FaGithub className="mr-2" />
              GitHub
            </button>
          </div>
        </div>
        <div className="text-center text-sm mt-4">
          <span className="text-[#251c1a]/60">Already have an account? </span>
          <Link to="/login" className="font-medium text-[#251c1a] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;