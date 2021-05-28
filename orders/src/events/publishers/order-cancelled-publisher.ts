import {
  Publisher,
  OrderCancelledEvent,
  Subjects
} from '@anfelos/ticketing_common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
