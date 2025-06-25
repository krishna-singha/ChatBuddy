import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering && !termsAccepted) {
      setError('You must agree to the Terms and Conditions.');
      return;
    }
    try {
      const credentials: Record<string, string> = isRegistering
        ? { name, email, password }
        : { email, password };
      await login(isRegistering ? 'register' : 'login', credentials);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isRegistering ? 'Create an Account' : 'Login to ChatBuddy'}
        </h2>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <input
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          {isRegistering && (
            <label className="flex items-start space-x-2 text-sm text-gray-300 mt-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 accent-cyan-500"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-cyan-400 hover:underline">
                  Terms and Conditions
                </a>
              </span>
            </label>
          )}

          <button
            className={`w-full px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg shadow-lg shadow-cyan-500/30 cursor-pointer transition-all ${isRegistering && !termsAccepted ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            type="submit"
            disabled={isRegistering && !termsAccepted}
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                className="text-cyan-400 hover:underline cursor-pointer"
                onClick={() => {
                  setIsRegistering(false);
                  setTermsAccepted(false);
                  setError('');
                }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                className="text-cyan-400 hover:underline cursor-pointer"
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                }}
              >
                Register
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
