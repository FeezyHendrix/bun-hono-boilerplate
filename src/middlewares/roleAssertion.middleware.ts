import { Context, Next } from 'hono';
import httpStatus from 'http-status';
import { HttpException } from '../exceptions/http.exception';

export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    if (!roles.includes(user.role)) {
      throw new HttpException(
        httpStatus.FORBIDDEN, 
        'You do not have permission to access this resource'
      );
    }

    await next();
  };
};

export const requireAdmin = requireRole('admin');

export const requireUser = requireRole('user', 'admin');