import { PrismaClient, Token, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { HttpException } from '../exceptions/http.exception';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

export class TokenService {
  private prisma = new PrismaClient();

  public async generateToken(
    userId: string,
    expires: Date,
    type: TokenType,
    secret = process.env.JWT_SECRET || 'secret'
  ): Promise<string> {
    const payload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expires.getTime() / 1000),
      type,
    };
    return jwt.sign(payload, secret);
  }

  public async saveToken(
    token: string,
    userId: string,
    expires: Date,
    type: TokenType,
    blacklisted = false
  ): Promise<Token> {
    return await this.prisma.token.create({
      data: {
        token,
        userId,
        expires,
        type,
        blacklisted,
      },
    });
  }

  public async verifyToken(token: string, type: TokenType): Promise<Token> {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      const tokenDoc = await this.prisma.token.findFirst({
        where: {
          token,
          type,
          blacklisted: false,
        },
      });

      if (!tokenDoc) {
        throw new HttpException(httpStatus.UNAUTHORIZED, 'Token not found');
      }

      if (tokenDoc.expires < new Date()) {
        throw new HttpException(httpStatus.UNAUTHORIZED, 'Token expired');
      }

      return tokenDoc;
    } catch (error) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Invalid token');
    }
  }

  public async generateAuthTokens(user: User): Promise<{
    access: { token: string; expires: Date };
    refresh: { token: string; expires: Date };
  }> {
    const accessTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const accessToken = await this.generateToken(
      user.id,
      accessTokenExpires,
      TokenType.ACCESS
    );
    const refreshToken = await this.generateToken(
      user.id,
      refreshTokenExpires,
      TokenType.REFRESH
    );

    await this.saveToken(accessToken, user.id, accessTokenExpires, TokenType.ACCESS);
    await this.saveToken(refreshToken, user.id, refreshTokenExpires, TokenType.REFRESH);

    return {
      access: {
        token: accessToken,
        expires: accessTokenExpires,
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires,
      },
    };
  }

  public async refreshAuth(refreshToken: string): Promise<{
    access: { token: string; expires: Date };
    refresh: { token: string; expires: Date };
  }> {
    try {
      const refreshTokenDoc = await this.verifyToken(refreshToken, TokenType.REFRESH);
      const user = await this.prisma.user.findUnique({
        where: { id: refreshTokenDoc.userId },
      });

      if (!user) {
        throw new HttpException(httpStatus.UNAUTHORIZED, 'User not found');
      }

      await this.prisma.token.delete({ where: { token: refreshToken } });
      return await this.generateAuthTokens(user);
    } catch (error) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
  }

  public async revokeToken(token: string): Promise<void> {
    const tokenDoc = await this.prisma.token.findUnique({ where: { token } });
    if (!tokenDoc) {
      throw new HttpException(httpStatus.NOT_FOUND, 'Token not found');
    }
    await this.prisma.token.delete({ where: { token } });
  }

  public async generateResetPasswordToken(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'No users found with this email');
    }

    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const resetPasswordToken = await this.generateToken(
      user.id,
      expires,
      TokenType.RESET_PASSWORD
    );
    await this.saveToken(resetPasswordToken, user.id, expires, TokenType.RESET_PASSWORD);
    
    return resetPasswordToken;
  }

  public async generateVerifyEmailToken(user: User): Promise<string> {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verifyEmailToken = await this.generateToken(
      user.id,
      expires,
      TokenType.VERIFY_EMAIL
    );
    await this.saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
    
    return verifyEmailToken;
  }
}