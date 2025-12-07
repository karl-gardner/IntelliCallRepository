import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AppDataSource } from '../data-source.js';
import { CustomerData } from '../entity/CustomerData.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const customerId = req.user!.id;
    const customerRepo = AppDataSource.getRepository(CustomerData);

    const customer = await customerRepo.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({
      textContent: customer.textContent || '',
      updatedAt: customer.updatedAt,
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put(
  '/',
  authenticateToken,
  [body('textContent').isString().withMessage('Text content must be a string')],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customerId = req.user!.id;
      const { textContent } = req.body;
      const customerRepo = AppDataSource.getRepository(CustomerData);

      const customer = await customerRepo.findOne({
        where: { id: customerId },
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      customer.textContent = textContent;
      await customerRepo.save(customer);

      return res.json({
        textContent: customer.textContent,
        updatedAt: customer.updatedAt,
      });
    } catch (error) {
      console.error('Save dashboard data error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/:customerId', authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;
    const customerRepo = AppDataSource.getRepository(CustomerData);

    const customer = await customerRepo.findOne({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({
      textContent: customer.textContent || '',
      updatedAt: customer.updatedAt,
    });
  } catch (error) {
    console.error('Get customer dashboard data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
