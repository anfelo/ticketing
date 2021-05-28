import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

import { TicketUpdatedEvent } from '@anfelos/ticketing_common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models';

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'concert updated',
    price: 10,
    userId: 'asdf'
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, data, ticket, msg };
};

it('finds, updates, and saves a ticket', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, ticket, msg } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
