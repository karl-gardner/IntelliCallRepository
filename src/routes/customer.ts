import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source.js';
import { CustomerData } from '../entity/CustomerData.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const customerRepo = AppDataSource.getRepository(CustomerData);
    const customers = await customerRepo.find({
      select: ['id', 'name', 'email', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return res.json(customers);
  } catch (error) {
    console.error('Get customers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const customerRepo = AppDataSource.getRepository(CustomerData);

    const customer = await customerRepo.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'createdAt'],
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/',
  // authenticateToken,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password } = req.body;
      const customerRepo = AppDataSource.getRepository(CustomerData);

      const existingCustomer = await customerRepo.findOne({ where: { email } });
      if (existingCustomer) {
        return res.status(409).json({ error: 'Customer with this email already exists' });
      }

      const customer = new CustomerData();
      customer.name = name;
      customer.email = email;

      if (password) {
        customer.password = await bcrypt.hash(password, 10);
      }

      await customerRepo.save(customer);

      return res.status(201).json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt,
      });
    } catch (error) {
      console.error('Create customer error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
