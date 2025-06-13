import { BaseService, Pagination } from "../commons/base.interface";
import { PrismaClient, User } from '@prisma/client';
import { CreateUserDto, UpdateUserDto } from "../validations/user.validation";
import { Id, Limit, Page } from "../commons/base.types";
import httpStatus from "http-status";
import { HttpException } from "../exceptions/http.exception";

export class UserService implements BaseService<User> {
  private prisma = new PrismaClient();

  public async create(userPayload: CreateUserDto): Promise<User> {
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
    return await this.prisma.user.create({
      data: {
        ...userPayload,
        password: hashedPassword,
      },
    });
  }

  public async findAll(
    filter: any = {},
    page: Page = 1 as Page,
    limit: Limit = 10 as Limit
  ): Promise<Pagination<Omit<User, 'password'>>> {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filter,
        skip,
        take: limit,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          deactivated: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where: filter }),
    ]);

    const totalPage = Math.ceil(total / limit);

    return {
      data: users,
      page,
      limit,
      totalPage,
    };
  }

  public async findOne(id: Id): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deactivated: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    return user;
  }

  public async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async updateOne(id: Id, userPayload: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    if (userPayload.email && userPayload.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: userPayload.email },
      });

      if (emailExists) {
        throw new HttpException(
          httpStatus.CONFLICT,
          `Email ${userPayload.email} is already in use`
        );
      }
    }

    let updateData: any = { ...userPayload };
    
    if ('password' in userPayload && userPayload.password) {
      updateData.password = await Bun.password.hash(userPayload.password);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deactivated: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  public async deleteOne(id: Id): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  public async deactivateUser(id: Id): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { deactivated: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deactivated: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  public async activateUser(id: Id): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { deactivated: false },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        deactivated: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}