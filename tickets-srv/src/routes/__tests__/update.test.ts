import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: '20'
    })
    .expect(201);
};

it('returns a 404 if the ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: 20
    })
    .expect(404);
});

it('returns a 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'concert',
      price: 20
    })
    .expect(401);
});

it('returns a 401 if user is not the owner of the ticket', async () => {
  const response = await createTicket();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'concert',
      price: 200
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: '20'
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      price: 200
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'concert'
    })
    .expect(400);
});

it('updates the ticket with provided input values', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new concert',
      price: 100
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('new concert');
  expect(ticketResponse.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new concert',
      price: 100
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'concert',
      price: 20
    })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new concert',
      price: 100
    })
    .expect(400);
});
