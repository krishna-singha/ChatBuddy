import React, { useMemo } from 'react';
import { validatePassword } from '../utils/formValidation';

interface Props {
  password: string;
}

const PasswordStrength: React.FC<Props> = ({ password }) => {
  const validation = useMemo(() => validatePassword(password), [password]);

  const score = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return Math.min(score, 4); // Cap score at 4
  }, [password]);

  const strength = useMemo(() => {
    switch (score) {
      case 0: return { text: 'Very Weak', color: 'text-red-500' };
      case 1: return { text: 'Weak', color: 'text-red-400' };
      case 2: return { text: 'Fair', color: 'text-yellow-400' };
      case 3: return { text: 'Good', color: 'text-blue-400' };
      case 4: return { text: 'Strong', color: 'text-green-400' };
      default: return { text: 'Very Weak', color: 'text-red-500' };
    }
  }, [score]);

  return (
    <div className="text-xs space-y-1 mt-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Strength:</span>
        <span className={strength.color}>{strength.text}</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 w-full rounded ${level <= score ? 'bg-blue-500' : 'bg-gray-600'}`}
          />
        ))}
      </div>
      {!validation.isValid && (
        <ul className="text-red-400 text-xs mt-2 space-y-0.5">
          {validation.errors.map((err, idx) => (
            <li key={idx} className="flex items-center gap-1">
              <span className="text-red-500">•</span> {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrength;
