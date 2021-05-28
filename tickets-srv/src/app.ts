import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  currentUser,
  errorHandler,
  NotFoundError
} from '@anfelos/ticketing_common';

import { newTicketRoutes } from './routes/new';
import { showTicketRoutes } from './routes/show';
import { indexTicketRoutes } from './routes/index';
import { updateTicketRoutes } from './routes/update';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);
app.use(currentUser);

app.use(newTicketRoutes);
app.use(showTicketRoutes);
app.use(indexTicketRoutes);
app.use(updateTicketRoutes);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
