/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "../auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("AuthService", () => {
  let service: AuthService;
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    } as any,
  };
  const mockJwt = { sign: jest.fn().mockReturnValue("signed-token") };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.spyOn(bcrypt, "compare");
    jest.spyOn(bcrypt, "hash");
  });

  describe("validateUser", () => {
    it("throws if user not found", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.validateUser("x", "y")).rejects.toThrow(UnauthorizedException);
    });

    it("throws if password does not match", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1", email: "a@b.com", password: "hash" });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.validateUser("a@b.com", "wrong")).rejects.toThrow(UnauthorizedException);
    });

    it("returns user without password when valid", async () => {
      const user = { id: "1", email: "a@b.com", password: "hash", name: "Name" };
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser("a@b.com", "pass");
      expect(result).toEqual({ id: "1", email: "a@b.com", name: "Name" });
    });
  });

  describe("login", () => {
    it("returns access token", async () => {
      const user = { id: "1", email: "a@b.com" };
      const res = await service.login(user as any);
      expect(mockJwt.sign).toHaveBeenCalledWith({ sub: "1", email: "a@b.com" });
      expect(res).toEqual({ access_token: "signed-token" });
    });
  });

  describe("register", () => {
    it("hashes password and creates user", async () => {
      const dto = { email: "a@b.com", password: "pass", name: "Name" };
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      (mockPrisma.user.create as jest.Mock).mockResolvedValue({
        id: "1",
        email: "a@b.com",
        password: "hashed",
        name: "Name",
      });
      const result = await service.register(dto as any);
      expect(bcrypt.hash).toHaveBeenCalledWith("pass", 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { email: "a@b.com", password: "hashed", name: "Name" },
      });
      expect(result).toEqual({ id: "1", email: "a@b.com", name: "Name" });
    });
  });
});
