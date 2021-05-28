import { Message } from 'node-nats-streaming';
import {
  Listener,
  Subjects,
  TicketCreatedEvent
} from '@anfelos/ticketing_common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;
    const ticket = Ticket.build({
      id,
      title,
      price
    });
    await ticket.save();

    msg.ack();
  }
}
