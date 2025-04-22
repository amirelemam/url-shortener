/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../auth.controller";
import { AuthService } from "../auth.service";
import { RegisterDto } from "../dto/register.dto";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue({ id: "1", email: "a@b.com", name: "Name" }),
      login: jest.fn().mockResolvedValue({ access_token: "token" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should register a new user", async () => {
    const dto: RegisterDto = { email: "a@b.com", password: "pass", name: "Name" };
    const result = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: "1", email: "a@b.com", name: "Name" });
  });

  it("should login an existing user", async () => {
    const req = { user: { id: "1", email: "a@b.com" } } as any;
    const result = await controller.login(req);
    expect(authService.login).toHaveBeenCalledWith(req.user);
    expect(result).toEqual({ access_token: "token" });
  });
});
