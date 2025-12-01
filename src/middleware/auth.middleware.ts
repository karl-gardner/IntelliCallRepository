import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Middleware for API routes - returns JSON errors
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Check for token in Authorization header (for API calls) or cookies (for SSR)
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const cookieToken = req.cookies?.token;
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware for page routes - redirects to login
export const authenticatePage = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};
