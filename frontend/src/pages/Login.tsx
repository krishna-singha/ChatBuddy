import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/auth/AuthContext';
import { isValidEmail, validateName, validatePassword } from "../utils/formValidation";
import PasswordStrength from '../components/PasswordStrength';

const Login: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isRegistering) {
      const nameCheck = validateName(form.name);
      if (!nameCheck.isValid) newErrors.name = nameCheck.errors[0];
    }

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Invalid email address";

    if (!form.password) newErrors.password = "Password is required";
    else {
      const passwordCheck = validatePassword(form.password);
      if (!passwordCheck.isValid) newErrors.password = passwordCheck.errors[0];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload: Record<string, string> = isRegistering
        ? { name: form.name, email: form.email, password: form.password }
        : { name: '', email: form.email, password: form.password };
      await login(isRegistering ? 'register' : 'login', payload);
    } catch (err: any) {
      setErrors({ email: err?.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 text-white">
      <div className="w-full max-w-md bg-gray-800/50 p-8 rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        <h2 className="text-3xl font-bold text-center mb-6">
          {isRegistering ? 'Create an Account' : 'Login to ChatBuddy'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <FormInput
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              autoComplete="name"
              error={errors.name}
            />
          )}
          <FormInput
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            autoComplete="email"
            error={errors.email}
          />
          <FormInput
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            autoComplete="current-password"
            error={errors.password}
          />
          {isRegistering && form.password && (
            <PasswordStrength password={form.password} />
          )}

          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg shadow-lg shadow-cyan-500/30 transition-transform duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button onClick={toggleMode} className="text-cyan-400 hover:underline cursor-pointer">
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={toggleMode}
                disabled={Object.keys(errors).length > 0}
                className={`text-cyan-400 hover:underline ${Object.keys(errors).length > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
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


const FormInput = ({
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: {
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete: string;
  error?: string;
}) => (
  <div>
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
    />
    {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
  </div>
);
