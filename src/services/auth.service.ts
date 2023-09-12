import { PrismaClient, User } from "@prisma/client";
import { CreateUserDto } from "../validations/user.validation";
import httpStatus from "http-status";
import { HttpException } from "../exceptions/http.exception";

class AuthService {
  public prisma = new PrismaClient();

  public async register(userPayload: CreateUserDto) {
    const findUser: User = await this.prisma.user.findUnique({
      where: { email: userPayload.email },
    });
    if (findUser)
      throw new HttpException(
        httpStatus.UNAUTHORIZED,
        `This email ${userPayload.email} already exists`
      );

    const hashedPassword = await Bun.password.hash(userPayload.password);
    const createUserData: User = await this.prisma.user.create({
      data: {
        email: userPayload.email,
        role: userPayload.role,
        fullName: userPayload.fullName,
        password: hashedPassword,
      },
    });
  }
}
