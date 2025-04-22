/* eslint-disable @typescript-eslint/require-await */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const match = await bcrypt.compare(pass, user.password);
    if (!match) throw new UnauthorizedException("Invalid credentials");
    const { password, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashed,
          name: dto.name,
        },
      });
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("email")) {
          throw new ConflictException("Email is already in use");
        }
      }

      throw error;
    }
  }
}
