/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUrlDto } from "./dto/create-url.dto";
import { UpdateUrlDto } from "./dto/update-url.dto";
import { UrlResponseDto } from "./dto/url-response.dto";
import { validateUrl } from "../common/utils/url-validator";
import { generateSlug } from "../common/utils/slug-generator";

@Injectable()
export class UrlsService {
  constructor(private prisma: PrismaService) {}

  async createShortUrl(createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
    const { longUrl, customSlug, userId } = createUrlDto;

    if (!validateUrl(longUrl)) {
      throw new ConflictException("Invalid URL format");
    }

    if (userId) {
      const existingForUser = await this.prisma.url.findFirst({
        where: { longUrl, userId },
      });

      if (existingForUser) {
        return {
          id: existingForUser.id,
          longUrl: existingForUser.longUrl,
          slug: existingForUser.slug,
          shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${existingForUser.slug}`,
          createdAt: existingForUser.createdAt,
        };
      }
    }

    let slug = customSlug;

    if (slug) {
      const existingUrlWithSlug = await this.prisma.url.findUnique({ where: { slug } });

      if (existingUrlWithSlug) {
        if (existingUrlWithSlug.longUrl === longUrl) {
          return {
            id: existingUrlWithSlug.id,
            longUrl: existingUrlWithSlug.longUrl,
            slug: existingUrlWithSlug.slug,
            shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${existingUrlWithSlug.slug}`,
            createdAt: existingUrlWithSlug.createdAt,
          };
        }

        // Slug exists but different URL, generate a new one
        slug = generateSlug();
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
          const randomSlugExists = await this.prisma.url.findUnique({ where: { slug } });

          if (!randomSlugExists) isUnique = true;
          else {
            slug = generateSlug();
            attempts++;
          }
        }

        if (!isUnique) throw new ConflictException("Failed to generate unique slug");
      }
    } else {
      slug = generateSlug();
    }

    const url = await this.prisma.url.create({
      data: {
        longUrl,
        slug,
        userId,
      },
    });

    return {
      id: url.id,
      longUrl: url.longUrl,
      slug: url.slug,
      shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${url.slug}`,
      createdAt: url.createdAt,
    };
  }

  async findUrlBySlug(slug: string) {
    const url: {
      id: string;
      slug: string;
      longUrl: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string | null;
    } | null = await this.prisma.url.findUnique({
      where: { slug },
    });

    if (!url) {
      throw new NotFoundException("URL not found");
    }

    return url;
  }

  async findUrlById(id: string): Promise<UrlResponseDto> {
    const url = await this.prisma.url.findUnique({
      where: { id },
      include: {
        _count: {
          select: { visits: true },
        },
      },
    });

    if (!url) {
      throw new NotFoundException("URL not found");
    }

    return {
      id: url.id,
      longUrl: url.longUrl,
      slug: url.slug,
      shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${url.slug}`,
      createdAt: url.createdAt,
      visitCount: url._count.visits,
    };
  }

  async findAllUrls(): Promise<UrlResponseDto[]> {
    const urls = await this.prisma.url.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { visits: true },
        },
      },
    });

    return urls.map(
      (url): UrlResponseDto => ({
        id: url.id,
        longUrl: url.longUrl,
        slug: url.slug,
        shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${url.slug}`,
        createdAt: url.createdAt,
        visitCount: url._count.visits,
      }),
    );
  }

  async findUrlsByUserId(userId: string): Promise<UrlResponseDto[]> {
    const urls = await this.prisma.url.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { visits: true },
        },
      },
    });

    return urls.map((url) => ({
      id: url.id,
      longUrl: url.longUrl,
      slug: url.slug,
      shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${url.slug}`,
      createdAt: url.createdAt,
      visitCount: url._count.visits,
    }));
  }

  async updateUrl(currSlug: string, updateUrlDto: UpdateUrlDto): Promise<UrlResponseDto> {
    const { newSlug } = updateUrlDto;

    if (newSlug && newSlug !== currSlug) {
      const existingUrl = await this.prisma.url.findFirst({
        where: {
          slug: newSlug,
        },
      });

      if (existingUrl) {
        throw new ConflictException("Slug already in use");
      }
    }

    const url = await this.prisma.url.update({
      where: { slug: currSlug },
      data: {
        slug: newSlug,
      },
    });

    return {
      id: url.id,
      longUrl: url.longUrl,
      slug: url.slug,
      shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${url.slug}`,
      createdAt: url.createdAt,
    };
  }

  async trackVisit(urlId: string, visitData: { ipAddress?: string; userAgent?: string; referrer?: string }) {
    return this.prisma.visit.create({
      data: {
        urlId,
        ipAddress: visitData.ipAddress,
        userAgent: visitData.userAgent,
        referrer: visitData.referrer,
      },
    });
  }

  async getUrlAnalytics(slug: string) {
    const url = await this.prisma.url.findUnique({
      where: { slug },
      include: {
        visits: {
          orderBy: { visitedAt: "desc" },
        },
      },
    });

    if (!url) {
      throw new NotFoundException("URL not found");
    }

    const totalVisits = url.visits.length;
    const lastDayVisits = url.visits.filter(
      (visit) => new Date(visit.visitedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000,
    ).length;

    const browsers = url.visits.reduce((acc, visit) => {
      const ua = visit.userAgent || "Unknown";
      let browser = "Unknown";

      if (ua.includes("Chrome")) browser = "Chrome";
      else if (ua.includes("Firefox")) browser = "Firefox";
      else if (ua.includes("Safari")) browser = "Safari";
      else if (ua.includes("Edge")) browser = "Edge";
      else if (ua.includes("MSIE") || ua.includes("Trident")) browser = "Internet Explorer";

      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});

    return {
      url: {
        id: url.id,
        longUrl: url.longUrl,
        slug: url.slug,
        shortUrl: `${process.env.BASE_URL || "http://localhost:3001"}/${url.slug}`,
        createdAt: url.createdAt,
      },
      analytics: {
        totalVisits,
        lastDayVisits,
        browsers,
        recentVisits: url.visits.slice(0, 10).map((visit) => ({
          visitedAt: visit.visitedAt,
          ipAddress: visit.ipAddress,
        })),
      },
    };
  }
}
