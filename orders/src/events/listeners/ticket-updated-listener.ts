import { Message } from 'node-nats-streaming';
import {
  Listener,
  Subjects,
  TicketUpdatedEvent
} from '@anfelos/ticketing_common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const { title, price } = data;
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    ticket.set({
      title,
      price
    });
    await ticket.save();

    msg.ack();
  }
}
