import { PrismaClient, User } from "@prisma/client";
import { CreateUserDto } from "../validations/user.validation";
import httpStatus from "http-status";
import { HttpException } from "../exceptions/http.exception";
import { TokenService, TokenType } from "./token.service";

export class AuthService {
  private prisma = new PrismaClient();
  private tokenService = new TokenService();

  public async register(userPayload: CreateUserDto): Promise<{
    user: Omit<User, 'password'>;
    tokens: {
      access: { token: string; expires: Date };
      refresh: { token: string; expires: Date };
    };
  }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userPayload.email },
    });
    
    if (existingUser) {
      throw new HttpException(
        httpStatus.CONFLICT,
        `This email ${userPayload.email} already exists`
      );
    }

    const hashedPassword = await Bun.password.hash(userPayload.password);
    const createUserData = await this.prisma.user.create({
      data: {
        email: userPayload.email,
        role: userPayload.role,
        fullName: userPayload.fullName,
        password: hashedPassword,
      },
    });

    const tokens = await this.tokenService.generateAuthTokens(createUserData);
    const { password, ...userWithoutPassword } = createUserData;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  public async login(email: string, password: string): Promise<{
    user: Omit<User, 'password'>;
    tokens: {
      access: { token: string; expires: Date };
      refresh: { token: string; expires: Date };
    };
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    const isPasswordMatch = await Bun.password.verify(password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
    }

    if (user.deactivated) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Account has been deactivated');
    }

    const tokens = await this.tokenService.generateAuthTokens(user);
    const { password: userPassword, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  public async logout(refreshToken: string): Promise<void> {
    const refreshTokenDoc = await this.prisma.token.findUnique({
      where: { token: refreshToken },
    });

    if (!refreshTokenDoc) {
      throw new HttpException(httpStatus.NOT_FOUND, 'Refresh token not found');
    }

    await this.prisma.token.delete({
      where: { token: refreshToken },
    });
  }

  public async refreshTokens(refreshToken: string): Promise<{
    access: { token: string; expires: Date };
    refresh: { token: string; expires: Date };
  }> {
    try {
      return await this.tokenService.refreshAuth(refreshToken);
    } catch (error) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Please authenticate');
    }
  }

  public async forgotPassword(email: string): Promise<string> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'No users found with this email');
    }

    const resetPasswordToken = await this.tokenService.generateResetPasswordToken(email);
    return resetPasswordToken;
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const resetPasswordTokenDoc = await this.tokenService.verifyToken(
        token,
        TokenType.RESET_PASSWORD
      );

      const user = await this.prisma.user.findUnique({
        where: { id: resetPasswordTokenDoc.userId },
      });

      if (!user) {
        throw new HttpException(httpStatus.UNAUTHORIZED, 'Password reset failed');
      }

      const hashedPassword = await Bun.password.hash(newPassword);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await this.prisma.token.deleteMany({
        where: {
          userId: user.id,
          type: TokenType.RESET_PASSWORD,
        },
      });
    } catch (error) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Password reset failed');
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    try {
      const verifyEmailTokenDoc = await this.tokenService.verifyToken(
        token,
        TokenType.VERIFY_EMAIL
      );

      const user = await this.prisma.user.findUnique({
        where: { id: verifyEmailTokenDoc.userId },
      });

      if (!user) {
        throw new HttpException(httpStatus.UNAUTHORIZED, 'Email verification failed');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });

      await this.prisma.token.deleteMany({
        where: {
          userId: user.id,
          type: TokenType.VERIFY_EMAIL,
        },
      });
    } catch (error) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Email verification failed');
    }
  }

  public async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    const isPasswordMatch = await Bun.password.verify(oldPassword, user.password);
    if (!isPasswordMatch) {
      throw new HttpException(httpStatus.UNAUTHORIZED, 'Incorrect old password');
    }

    const hashedPassword = await Bun.password.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
