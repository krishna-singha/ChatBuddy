const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string) => {
  const errors = [];
  if (!name || name.trim() === "") {
    errors.push("Name is required");
  } else if (name.length < 3) {
    errors.push("Name must be at least 3 characters long");
  } else if (name.length > 50) {
    errors.push("Name must not exceed 50 characters");
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Password validation function
const validatePassword = (password: string) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one digit");
  }
  if (!/[@$!%*?&#]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export all functions
export { isValidEmail, validateName, validatePassword };
