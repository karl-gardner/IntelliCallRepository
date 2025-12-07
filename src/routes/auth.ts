import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source.js';
import { CustomerData } from '../entity/CustomerData.js';
import { generateToken } from '../utils/jwt.js';

const router = Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').optional(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const customerRepo = AppDataSource.getRepository(CustomerData);

      const customer = await customerRepo.findOne({ where: { email } });

      if (!customer) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (customer.password) {
        if (!password) {
          return res.status(401).json({ error: 'Password required' });
        }
        const isValidPassword = await bcrypt.compare(password, customer.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }

      const token = generateToken({ id: customer.id, email: customer.email });

      return res.json({
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          createdAt: customer.createdAt,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post(
  '/login-as-customer',
  [body('customerId').isUUID().withMessage('Valid customer ID required')],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { customerId } = req.body;
      const customerRepo = AppDataSource.getRepository(CustomerData);

      const customer = await customerRepo.findOne({ where: { id: customerId } });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const token = generateToken({ id: customer.id, email: customer.email });

      return res.json({
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          createdAt: customer.createdAt,
        },
      });
    } catch (error) {
      console.error('Login as customer error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
