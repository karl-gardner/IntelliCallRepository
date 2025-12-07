import { Router } from 'express';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../../data-source.js';
import { CustomerData } from '../../entity/CustomerData.js';
import { generateToken } from '../../utils/jwt.js';
import { authenticatePage, AuthRequest } from '../../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('pages/landing', { title: 'Home' });
});

router.get('/login', (req, res) => {
  if (req.cookies?.token) {
    return res.redirect('/dashboard');
  }
  res.render('pages/login', { title: 'Login', error: null });
});

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

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
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

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

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

router.get('/admin', async (req, res) => {
  try {
    const customerRepo = AppDataSource.getRepository(CustomerData);

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

router.get('/privacy', (req, res) => {
  res.render('pages/privacy', { title: 'Privacy Policy' });
});

export default router;
