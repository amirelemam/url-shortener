/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Res,
  HttpStatus,
  UseGuards,
  NotFoundException,
  Req,
} from "@nestjs/common";
import { Response } from "express";
import { UrlsService } from "./urls.service";
import { CreateUrlDto } from "./dto/create-url.dto";
import { UpdateUrlDto } from "./dto/update-url.dto";
import { ThrottlerGuard } from "@nestjs/throttler";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from "@nestjs/swagger";
import { UrlResponseDto } from "./dto/url-response.dto";

@ApiTags("URLs")
@Controller()
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  @Post("api/urls/shorten")
  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({ status: 201, description: "Short URL created", type: UrlResponseDto })
  @ApiResponse({ status: 409, description: "Invalid URL format or slug conflict" })
  async createShortUrl(@Body() createUrlDto: CreateUrlDto, @Req() req) {
    const userId = req.user?.userId;
    if (userId) createUrlDto.userId = userId;

    return this.urlsService.createShortUrl(createUrlDto);
  }

  @Get("api/urls")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "List all URLs for the current user" })
  @ApiResponse({ status: 200, type: [UrlResponseDto] })
  async getAllUrls(@Req() req) {
    const userId = req.user.userId;
    return this.urlsService.findUrlsByUserId(userId);
  }

  @Get("api/urls/:slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get a single URL by slug" })
  @ApiParam({ name: "slug" })
  @ApiResponse({ status: 200, type: UrlResponseDto })
  @ApiResponse({ status: 404, description: "Not found" })
  async getUrl(@Param("slug") slug: string) {
    return this.urlsService.findUrlBySlug(slug);
  }

  @Put("api/urls/:slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update the slug of an existing URL" })
  @ApiParam({ name: "slug" })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({ status: 200, type: UrlResponseDto })
  @ApiResponse({ status: 409, description: "Slug already in use" })
  async updateUrl(@Param("slug") slug: string, @Body() updateUrlDto: UpdateUrlDto) {
    return this.urlsService.updateUrl(slug, updateUrlDto);
  }

  @Get("api/analytics/:slug")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get visit analytics for a URL" })
  @ApiParam({ name: "slug" })
  @ApiResponse({ status: 200, description: "Analytics payload" })
  @ApiResponse({ status: 404, description: "URL not found" })
  async getUrlAnalytics(@Param("slug") slug: string) {
    return this.urlsService.getUrlAnalytics(slug);
  }

  @Get(":slug")
  @ApiOperation({ summary: "Redirect to the original long URL" })
  @ApiParam({ name: "slug", description: "The short URL slug" })
  @ApiResponse({ status: 301, description: "Redirected" })
  @ApiResponse({ status: 500, description: "Server error" })
  async redirectToUrl(@Param("slug") slug: string, @Res() res: Response) {
    try {
      const url = await this.urlsService.findUrlBySlug(slug);

      await this.urlsService.trackVisit(url.id, {
        ipAddress: res.req.ip,
        userAgent: res.req.headers["user-agent"],
        referrer: res.req.headers.referer,
      });

      return res.redirect(HttpStatus.MOVED_PERMANENTLY, url.longUrl);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return res.redirect(HttpStatus.MOVED_PERMANENTLY, "http://localhost:3000/b4kCpm");
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("Server error");
    }
  }
}
