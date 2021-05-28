import {
  Publisher,
  Subjects,
  TicketCreatedEvent
} from '@anfelos/ticketing_common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
