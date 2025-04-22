/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";
import { RegisterDto } from "./dto/register.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "User registered" })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login and retrieve JWT access token" })
  @ApiResponse({ status: 200, description: "JWT token" })
  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
