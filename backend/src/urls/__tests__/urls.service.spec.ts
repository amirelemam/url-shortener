/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UrlsService } from "../urls.service";
import { PrismaService } from "../../prisma/prisma.service";
import { generateSlug } from "../../common/utils/slug-generator";
import { validateUrl } from "../../common/utils/url-validator";
import { UrlResponseDto } from "../dto/url-response.dto";

jest.mock("../../common/utils/slug-generator", () => ({
  generateSlug: jest.fn(() => "ABC123"),
}));

jest.mock("../../common/utils/url-validator", () => ({
  validateUrl: jest.fn(() => true),
}));

describe("UrlsService", () => {
  const mockPrisma = {
    url: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    visit: {
      create: jest.fn(),
    },
  };

  let service: UrlsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UrlsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(UrlsService);
    jest.clearAllMocks();
  });

  describe("createShortUrl", () => {
    it("creates a fresh URL when no custom slug is supplied", async () => {
      mockPrisma.url.create.mockResolvedValue({
        id: "1",
        longUrl: "http://example.com",
        slug: "ABC123",
        createdAt: new Date(),
      });

      const res = await service.createShortUrl({ longUrl: "http://example.com" });

      expect(validateUrl).toHaveBeenCalledWith("http://example.com");
      expect(generateSlug).toHaveBeenCalledTimes(1);
      expect(mockPrisma.url.create).toHaveBeenCalledWith({
        data: { longUrl: "http://example.com", slug: "ABC123", userId: undefined },
      });
      expect(res.shortUrl).toBe("http://localhost:3001/ABC123");
    });

    it("uses the provided custom slug when it is free", async () => {
      mockPrisma.url.findUnique.mockResolvedValue(null);
      mockPrisma.url.create.mockResolvedValue({
        id: "2",
        longUrl: "http://my.site",
        slug: "MYSLUG",
        createdAt: new Date(),
      });

      const res = await service.createShortUrl({
        longUrl: "http://my.site",
        customSlug: "MYSLUG",
      });

      expect(mockPrisma.url.findUnique).toHaveBeenCalledWith({ where: { slug: "MYSLUG" } });
      expect(res.slug).toBe("MYSLUG");
    });

    it("returns existing record when slug/URL pair already exists", async () => {
      const existing = {
        id: "3",
        longUrl: "http://same.site",
        slug: "DUP",
        createdAt: new Date(),
      };
      mockPrisma.url.findUnique.mockResolvedValue(existing);

      const res = await service.createShortUrl({
        longUrl: "http://same.site",
        customSlug: "DUP",
      });

      expect(res.id).toBe(existing.id);
      expect(mockPrisma.url.create).not.toHaveBeenCalled();
    });

    it("generates a new slug if custom slug collides with different URL", async () => {
      mockPrisma.url.findUnique.mockResolvedValueOnce({}).mockResolvedValueOnce(null);
      mockPrisma.url.create.mockResolvedValue({
        id: "4",
        longUrl: "http://new.url",
        slug: "ABC123",
        createdAt: new Date(),
      });

      const res = await service.createShortUrl({
        longUrl: "http://new.url",
        customSlug: "DUP",
      });

      expect(generateSlug).toHaveBeenCalledTimes(1);
      expect(res.slug).toBe("ABC123");
    });

    it("throws ConflictException on invalid URL", async () => {
      (validateUrl as jest.Mock).mockReturnValueOnce(false);

      await expect(service.createShortUrl({ longUrl: "notaurl" })).rejects.toBeInstanceOf(ConflictException);
    });

    it("throws ConflictException after 5 unsuccess­ful slug attempts", async () => {
      mockPrisma.url.findUnique.mockResolvedValue({});

      await expect(service.createShortUrl({ longUrl: "http://x.com", customSlug: "BAD" })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it("persists userId when present", async () => {
      mockPrisma.url.create.mockResolvedValue({
        id: "5",
        longUrl: "http://user.url",
        slug: "ABC123",
        userId: "u1",
        createdAt: new Date(),
      });

      await service.createShortUrl({
        longUrl: "http://user.url",
        userId: "u1",
      });

      expect(mockPrisma.url.create).toHaveBeenCalledWith({
        data: { longUrl: "http://user.url", slug: "ABC123", userId: "u1" },
      });
    });
  });

  describe("findUrlBySlug", () => {
    it("returns found url", async () => {
      const fakeUrl = { id: "1", slug: "s", longUrl: "L", createdAt: new Date(), updatedAt: new Date(), userId: null };
      mockPrisma.url.findUnique.mockResolvedValue(fakeUrl);
      await expect(service.findUrlBySlug("s")).resolves.toEqual(fakeUrl);
      expect(mockPrisma.url.findUnique).toHaveBeenCalledWith({ where: { slug: "s" } });
    });

    it("throws if not found", async () => {
      mockPrisma.url.findUnique.mockResolvedValue(null);
      await expect(service.findUrlBySlug("x")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findUrlById", () => {
    it("returns UrlResponseDto when found", async () => {
      const now = new Date();
      const db = {
        id: "id1",
        slug: "slug1",
        longUrl: "http://x",
        createdAt: now,
        _count: { visits: 7 },
      };
      mockPrisma.url.findUnique.mockResolvedValue(db);
      const dto = await service.findUrlById("id1");
      expect(dto).toEqual<UrlResponseDto>({
        id: "id1",
        slug: "slug1",
        longUrl: "http://x",
        shortUrl: `http://localhost:3001/slug1`,
        createdAt: now,
        visitCount: 7,
      });
      expect(mockPrisma.url.findUnique).toHaveBeenCalledWith({
        where: { id: "id1" },
        include: { _count: { select: { visits: true } } },
      });
    });

    it("throws if not found", async () => {
      mockPrisma.url.findUnique.mockResolvedValue(null);
      await expect(service.findUrlById("nope")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findAllUrls", () => {
    it("maps DB rows to UrlResponseDto[]", async () => {
      const now = new Date();
      const rows = [
        { id: "1", slug: "a", longUrl: "L", createdAt: now, _count: { visits: 1 } },
        { id: "2", slug: "b", longUrl: "M", createdAt: now, _count: { visits: 2 } },
      ];
      mockPrisma.url.findMany.mockResolvedValue(rows);
      const res = await service.findAllUrls();
      expect(res).toEqual([
        { id: "1", slug: "a", longUrl: "L", shortUrl: `http://localhost:3001/a`, createdAt: now, visitCount: 1 },
        { id: "2", slug: "b", longUrl: "M", shortUrl: `http://localhost:3001/b`, createdAt: now, visitCount: 2 },
      ]);
      expect(mockPrisma.url.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { visits: true } } },
      });
    });
  });

  describe("findUrlsByUserId", () => {
    it("filters by userId and maps", async () => {
      const now = new Date();
      const rows = [{ id: "u1", slug: "s1", longUrl: "L1", createdAt: now, _count: { visits: 3 } }];
      mockPrisma.url.findMany.mockResolvedValue(rows);
      const res = await service.findUrlsByUserId("user1");
      expect(res).toEqual([
        { id: "u1", slug: "s1", longUrl: "L1", shortUrl: `http://localhost:3001/s1`, createdAt: now, visitCount: 3 },
      ]);
      expect(mockPrisma.url.findMany).toHaveBeenCalledWith({
        where: { userId: "user1" },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { visits: true } } },
      });
    });
  });

  describe("updateUrl", () => {
    it("throws when newSlug exists already", async () => {
      mockPrisma.url.findFirst.mockResolvedValue({ slug: "taken" });
      await expect(service.updateUrl("old", { newSlug: "taken" } as any)).rejects.toThrow(ConflictException);
      expect(mockPrisma.url.findFirst).toHaveBeenCalledWith({ where: { slug: "taken" } });
    });

    it("updates and returns dto when OK", async () => {
      mockPrisma.url.findFirst.mockResolvedValue(null);
      const now = new Date();
      const updated = { id: "1", slug: "new", longUrl: "L", createdAt: now };
      mockPrisma.url.update.mockResolvedValue(updated);
      await expect(service.updateUrl("old", { newSlug: "new" } as any)).resolves.toEqual({
        id: "1",
        slug: "new",
        longUrl: "L",
        shortUrl: `http://localhost:3001/new`,
        createdAt: now,
      });
      expect(mockPrisma.url.update).toHaveBeenCalledWith({
        where: { slug: "old" },
        data: { slug: "new" },
      });
    });
  });

  describe("trackVisit", () => {
    it("delegates to prisma.visit.create", async () => {
      const created = { id: "v1", urlId: "u1", ipAddress: "1.1", userAgent: "UA", referrer: "ref" };
      mockPrisma.visit.create.mockResolvedValue(created);
      await expect(service.trackVisit("u1", { ipAddress: "1.1", userAgent: "UA", referrer: "ref" })).resolves.toEqual(
        created,
      );
      expect(mockPrisma.visit.create).toHaveBeenCalledWith({
        data: { urlId: "u1", ipAddress: "1.1", userAgent: "UA", referrer: "ref" },
      });
    });
  });

  describe("getUrlAnalytics", () => {
    const now = Date.now();
    const recent = new Date(now - 1_000).toISOString();
    const old = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();

    it("throws if url not found", async () => {
      mockPrisma.url.findUnique.mockResolvedValue(null);
      await expect(service.getUrlAnalytics("x")).rejects.toThrow(NotFoundException);
    });

    it("computes analytics correctly", async () => {
      const db = {
        id: "u1",
        slug: "s1",
        longUrl: "L1",
        createdAt: new Date(now),
        visits: [
          { visitedAt: recent, ipAddress: "1.1.1.1", userAgent: "Chrome/1", referrer: "" },
          { visitedAt: old, ipAddress: "2.2.2.2", userAgent: "Firefox/2", referrer: "" },
        ],
      };
      mockPrisma.url.findUnique.mockResolvedValue(db);

      const result = await service.getUrlAnalytics("s1");

      expect(result.url).toEqual({
        id: "u1",
        slug: "s1",
        longUrl: "L1",
        shortUrl: `http://localhost:3001/s1`,
        createdAt: new Date(now),
      });

      expect(result.analytics.totalVisits).toBe(2);
      expect(result.analytics.lastDayVisits).toBe(1);
      expect(result.analytics.browsers).toEqual({ Chrome: 1, Firefox: 1 });
      expect(result.analytics.recentVisits).toEqual([
        { visitedAt: new Date(recent).toISOString(), ipAddress: "1.1.1.1" },
        { visitedAt: new Date(old).toISOString(), ipAddress: "2.2.2.2" },
      ]);
      expect(mockPrisma.url.findUnique).toHaveBeenCalledWith({
        where: { slug: "s1" },
        include: { visits: { orderBy: { visitedAt: "desc" } } },
      });
    });
  });
});
