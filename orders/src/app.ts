import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  currentUser,
  errorHandler,
  NotFoundError
} from '@anfelos/ticketing_common';

import { newOrderRoutes } from './routes/new';
import { showOrderRoutes } from './routes/show';
import { indexOrderRoutes } from './routes/index';
import { deleteOrderRoutes } from './routes/delete';

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

app.use(newOrderRoutes);
app.use(showOrderRoutes);
app.use(indexOrderRoutes);
app.use(deleteOrderRoutes);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
