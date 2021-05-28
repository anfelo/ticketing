import {
  Publisher,
  OrderCreatedEvent,
  Subjects
} from '@anfelos/ticketing_common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
