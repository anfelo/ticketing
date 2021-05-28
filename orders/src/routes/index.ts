import { requireAuth } from '@anfelos/ticketing_common';
import express, { Request, Response } from 'express';
import { Order } from '../models';

const router = express.Router();

router.get('/api/orders/', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    'ticket'
  );
  res.send(orders);
});

export { router as indexOrderRoutes };
