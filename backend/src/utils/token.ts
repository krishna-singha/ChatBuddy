import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }

  const token = jwt.sign({ userId }, jwtSecret, {
    expiresIn: '7d',
  });

  return token;
};
