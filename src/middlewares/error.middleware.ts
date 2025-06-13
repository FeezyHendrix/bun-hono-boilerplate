import { Context } from 'hono';
import { HttpException } from '../exceptions/http.exception';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const errorHandler = (error: Error, c: Context) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let details: any = undefined;

  if (error instanceof HttpException) {
    statusCode = error.status;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = 'Validation Error';
    details = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
  } else if (error instanceof PrismaClientKnownRequestError) {
    statusCode = httpStatus.BAD_REQUEST;
    
    switch (error.code) {
      case 'P2002':
        message = 'Unique constraint violation';
        details = {
          field: error.meta?.target,
          message: 'This value already exists',
        };
        break;
      case 'P2025':
        statusCode = httpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003':
        message = 'Foreign key constraint violation';
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        break;
      default:
        message = 'Database error occurred';
        break;
    }
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'Token expired';
  } else if (error.name === 'NotBeforeError') {
    statusCode = httpStatus.UNAUTHORIZED;
    message = 'Token not active';
  }

  const response: any = {
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: c.req.path,
  };

  if (details) {
    response.details = details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  console.error(`[${new Date().toISOString()}] Error ${statusCode}: ${message}`, {
    error: error.message,
    stack: error.stack,
    path: c.req.path,
    method: c.req.method,
  });

  return c.json(response, statusCode);
};