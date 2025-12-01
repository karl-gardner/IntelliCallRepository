import jwt from 'jsonwebtoken';

export const generateToken = (payload: { id: string; email: string }): string => {
  const secret = process.env.JWT_SECRET || 'default-secret-change-me';
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): { id: string; email: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
};
