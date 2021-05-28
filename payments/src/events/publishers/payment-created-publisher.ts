import {
  Subjects,
  Publisher,
  PaymentCreatedEvent
} from '@anfelos/ticketing_common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
