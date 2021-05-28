import {
  Publisher,
  Subjects,
  TicketUpdatedEvent
} from '@anfelos/ticketing_common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
