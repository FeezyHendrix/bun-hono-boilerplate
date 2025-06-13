import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { route as userRoutes } from './src/v1/user.routes';
import { errorHandler } from './src/middlewares/error.middleware';
import { HttpException } from './src/exceptions/http.exception';
import httpStatus from 'http-status';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

const defaultRoutes = [
  {
    path: '/v1/users',
    route: userRoutes,
  },
];

app.get('/', (c) => {
  return c.json({
    statusCode: httpStatus.OK,
    message: 'Bun Hono Prisma Boilerplate API',
    version: '1.0.0',
    docs: '/v1/users for user management and auth endpoints',
  });
});

app.notFound(() => {
  throw new HttpException(httpStatus.NOT_FOUND, 'Route not found');
});

app.onError(errorHandler);

defaultRoutes.forEach((route) => {
  app.route(`${route.path}`, route.route);
});

export default app;