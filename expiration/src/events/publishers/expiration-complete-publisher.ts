import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent
} from '@anfelos/ticketing_common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
