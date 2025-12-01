import { Router } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../data-source.js';
import { CustomerData } from '../../entity/CustomerData.js';
import { generateToken } from '../../utils/jwt.utils.js';
import { authenticatePage, AuthRequest } from '../../middleware/auth.middleware.js';

const router = Router();

// Landing page
router.get('/', (req, res) => {
  res.render('pages/landing', { title: 'Home' });
});

// Login page (GET)
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.cookies?.token) {
    return res.redirect('/dashboard');
  }
  res.render('pages/login', { title: 'Login', error: null });
});

// Login page (POST)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const customerRepo = AppDataSource.getRepository(CustomerData);
    const customer = await customerRepo.findOne({ where: { email } });

    if (!customer) {
      return res.render('pages/login', {
        title: 'Login',
        error: 'Invalid credentials'
      });
    }

    // If customer has a password, verify it
    if (customer.password) {
      if (!password) {
        return res.render('pages/login', {
          title: 'Login',
          error: 'Password required'
        });
      }
      const isValidPassword = await bcrypt.compare(password, customer.password);
      if (!isValidPassword) {
        return res.render('pages/login', {
          title: 'Login',
          error: 'Invalid credentials'
        });
      }
    }

    const token = generateToken({ id: customer.id, email: customer.email });

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    });

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return res.render('pages/login', {
      title: 'Login',
      error: 'An error occurred. Please try again.'
    });
  }
});

// Login as customer (admin feature)
router.post('/login-as-customer', authenticatePage, async (req: AuthRequest, res) => {
  const { customerId } = req.body;

  try {
    const customerRepo = AppDataSource.getRepository(CustomerData);
    const customer = await customerRepo.findOne({ where: { id: customerId } });

    if (!customer) {
      return res.redirect('/admin');
    }

    const token = generateToken({ id: customer.id, email: customer.email });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login as customer error:', error);
    return res.redirect('/admin');
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Dashboard page
router.get('/dashboard', authenticatePage, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const customerRepo = AppDataSource.getRepository(CustomerData);

    const customer = await customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      res.clearCookie('token');
      return res.redirect('/login');
    }

    res.render('pages/dashboard', {
      title: 'Dashboard',
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      },
      dashboardData: {
        textContent: customer.textContent || '',
        updatedAt: customer.updatedAt
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.redirect('/login');
  }
});

// Admin page
router.get('/admin', async (req, res) => {
  try {
    const customerRepo = AppDataSource.getRepository(CustomerData);

    // Get all customers
    const customers = await customerRepo.find({
      select: ['id', 'name', 'email', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    res.render('pages/admin', {
      title: 'Admin',
      user: {
        id: 'admin',
        name: 'Admin',
        email: 'admin@intellicall.com'
      },
      customers
    });
  } catch (error) {
    console.error('Admin page error:', error);
    res.status(500).send('Error loading admin page');
  }
});

// Privacy page
router.get('/privacy', (req, res) => {
  res.render('pages/privacy', { title: 'Privacy Policy' });
});

export default router;
