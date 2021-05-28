import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order, Payment } from '../../models';
import { OrderStatus } from '@anfelos/ticketing_common';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exists', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdfg',
      orderId: mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asdfg',
      orderId: order.id
    })
    .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    price: 10,
    userId: userId,
    version: 0
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'asdfg',
      orderId: order.id
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: userId,
    version: 0
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  console.log((stripe.charges.create as jest.Mock).mock.calls);
  expect(stripe.charges.create).toHaveBeenCalledTimes(1);
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: 'someId'
  });
  expect(payment).not.toBeNull();
});
