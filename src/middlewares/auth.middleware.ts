import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import httpStatus from 'http-status';
import { HttpException } from '../exceptions/http.exception';
import { TokenType } from '../services/token.service';

const prisma = new PrismaClient();

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    
    const tokenDoc = await prisma.token.findFirst({
      where: {
        token,
        type: TokenType.ACCESS,
        blacklisted: false,
      },
    });

    if (!tokenDoc) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    if (tokenDoc.expires < new Date()) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Token expired');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
    });

    if (!user) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }

    if (user.deactivated) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Account has been deactivated');
    }

    c.set('user', user);
    c.set('token', tokenDoc);
    
    await next();
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        
        const tokenDoc = await prisma.token.findFirst({
          where: {
            token,
            type: TokenType.ACCESS,
            blacklisted: false,
          },
        });

        if (tokenDoc && tokenDoc.expires >= new Date()) {
          const user = await prisma.user.findUnique({
            where: { id: payload.sub as string },
          });

          if (user && !user.deactivated) {
            c.set('user', user);
            c.set('token', tokenDoc);
          }
        }
      }
    }
    
    await next();
  } catch (error) {
    await next();
  }
};