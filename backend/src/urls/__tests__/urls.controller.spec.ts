/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-require-imports */
import { Test, TestingModule } from "@nestjs/testing";
import { UrlsController } from "../urls.controller";
import { UrlsService } from "../urls.service";
import { ConflictException, NotFoundException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";

describe("UrlsService", () => {
  let service: UrlsService;
  const mockPrisma: any = {
    url: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    visit: { create: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<UrlsService>(UrlsService);

    jest.clearAllMocks();
  });

  describe("createShortUrl", () => {
    it("should throw on invalid URL", async () => {
      jest.spyOn(require("../../common/utils/url-validator"), "validateUrl").mockReturnValue(false);
      await expect(
        service.createShortUrl({ longUrl: "bad", customSlug: undefined, userId: null } as any),
      ).rejects.toThrow(ConflictException);
    });

    it("should create new slug when none provided", async () => {
      jest.spyOn(require("../../common/utils/url-validator"), "validateUrl").mockReturnValue(true);
      jest.spyOn(require("../../common/utils/slug-generator"), "generateSlug").mockReturnValue("abc");
      mockPrisma.url.create.mockResolvedValue({ id: "1", longUrl: "http://a", slug: "abc", createdAt: new Date() });
      const res = await service.createShortUrl({ longUrl: "http://a", customSlug: undefined, userId: null } as any);
      expect(res.slug).toBe("abc");
      expect(mockPrisma.url.create).toHaveBeenCalled();
    });

    it("should reuse slug when customSlug exists with same URL", async () => {
      jest.spyOn(require("../../common/utils/url-validator"), "validateUrl").mockReturnValue(true);
      mockPrisma.url.findUnique.mockResolvedValue({ id: "1", longUrl: "http://x", slug: "x", createdAt: new Date() });
      const res = await service.createShortUrl({ longUrl: "http://x", customSlug: "x", userId: null } as any);
      expect(res.slug).toBe("x");
    });

    it("should throw if slug collision not resolved", async () => {
      jest.spyOn(require("../../common/utils/url-validator"), "validateUrl").mockReturnValue(true);
      mockPrisma.url.findUnique.mockResolvedValueOnce({ id: "1", longUrl: "http://y", slug: "y" });
      jest.spyOn(require("../../common/utils/slug-generator"), "generateSlug").mockReturnValue("dup");
      mockPrisma.url.findUnique.mockResolvedValue({ id: "2", longUrl: "http://z", slug: "dup" });
      await expect(
        service.createShortUrl({ longUrl: "http://z", customSlug: "dup", userId: null } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("findUrlBySlug", () => {
    it("returns url when found", async () => {
      mockPrisma.url.findUnique.mockResolvedValue({ id: "1", slug: "a", longUrl: "http://a" } as any);
      await expect(service.findUrlBySlug("a")).resolves.toHaveProperty("id", "1");
    });
    it("throws NotFoundException when missing", async () => {
      mockPrisma.url.findUnique.mockResolvedValue(null);
      await expect(service.findUrlBySlug("a")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateUrl", () => {
    it("updates slug when valid", async () => {
      mockPrisma.url.findFirst.mockResolvedValue(null);
      mockPrisma.url.update.mockResolvedValue({
        id: "1",
        slug: "new-slug",
        longUrl: "https://example.com",
        createdAt: new Date(),
      });

      const result = await service.updateUrl("old", { newSlug: "new-slug" } as any);
      expect(result.slug).toBe("new-slug");
    });
    it("updates slug when valid", async () => {
      mockPrisma.url.findFirst.mockResolvedValue(null);
      mockPrisma.url.update.mockResolvedValue({ id: "1", longUrl: "u", slug: "c", createdAt: new Date() });
      const res = await service.updateUrl("a", { newSlug: "c" } as any);
      expect(res.slug).toBe("c");
    });
  });

  describe("trackVisit", () => {
    it("creates a visit record", async () => {
      mockPrisma.visit.create.mockResolvedValue({});
      await service.trackVisit("1", { ipAddress: "1.2.3.4" });
      expect(mockPrisma.visit.create).toHaveBeenCalledWith({ data: expect.objectContaining({ urlId: "1" }) });
    });
  });

  describe("getUrlAnalytics", () => {
    it("throws when url not found", async () => {
      mockPrisma.url.findUnique.mockResolvedValue(null);
      await expect(service.getUrlAnalytics("s")).rejects.toThrow(NotFoundException);
    });
    it("returns analytics data", async () => {
      const now = Date.now();
      const visits = [
        { visitedAt: new Date(now - 1000), ipAddress: "ip1", userAgent: "Chrome UA" },
        { visitedAt: new Date(now - 25 * 3600 * 1000), ipAddress: "ip2", userAgent: "Firefox UA" },
      ];
      mockPrisma.url.findUnique.mockResolvedValue({
        id: "1",
        slug: "s",
        longUrl: "http://a",
        createdAt: new Date(),
        visits,
      } as any);
      const { analytics } = await service.getUrlAnalytics("s");
      expect(analytics.totalVisits).toBe(2);
      expect(analytics.lastDayVisits).toBe(1);
      expect(analytics.recentVisits[0]).toHaveProperty("ipAddress");
    });
  });
});

describe("UrlsController", () => {
  let controller: UrlsController;
  const mockService: any = {
    createShortUrl: jest.fn(),
    findUrlBySlug: jest.fn(),
    trackVisit: jest.fn(),
    findUrlsByUserId: jest.fn(),
    updateUrl: jest.fn(),
    getUrlAnalytics: jest.fn(),
  };

  beforeEach(() => {
    controller = new UrlsController(mockService);
    jest.resetAllMocks();
  });

  it("createShortUrl calls service", async () => {
    mockService.createShortUrl.mockResolvedValue("ok");
    const req: any = { user: { userId: "u1" } };
    expect(await controller.createShortUrl({ longUrl: "x" } as any, req)).toBe("ok");
    expect(mockService.createShortUrl).toHaveBeenCalled();
  });

  describe("redirectToUrl", () => {
    let res: any;
    beforeEach(() => {
      res = {
        req: { ip: "1.2.3.4", headers: { "user-agent": "ua", referer: "ref" } },
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });

    it("redirects to longUrl on success", async () => {
      mockService.findUrlBySlug.mockResolvedValue({ id: "1", longUrl: "http://dest" });
      await controller.redirectToUrl("s", res as Response);
      expect(mockService.trackVisit).toHaveBeenCalledWith("1", expect.any(Object));
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.MOVED_PERMANENTLY, "http://dest");
    });

    it("redirects to fallback on NotFoundException", async () => {
      mockService.findUrlBySlug.mockRejectedValue(new NotFoundException());
      await controller.redirectToUrl("s", res as Response);
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.MOVED_PERMANENTLY, "http://localhost:3000/b4kCpm");
    });

    it("returns 500 on other errors", async () => {
      mockService.findUrlBySlug.mockRejectedValue(new Error());
      await controller.redirectToUrl("s", res as Response);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.send).toHaveBeenCalledWith("Server error");
    });
  });

  it("getAllUrls returns service result", async () => {
    mockService.findUrlsByUserId.mockResolvedValue(["u"]);
    const req: any = { user: { userId: "u1" } };
    expect(await controller.getAllUrls(req)).toEqual(["u"]);
  });

  it("getUrl returns service result", async () => {
    mockService.findUrlBySlug.mockResolvedValue("u");
    expect(await controller.getUrl("s")).toBe("u");
  });

  it("updateUrl returns service result", async () => {
    mockService.updateUrl.mockResolvedValue("u");
    expect(await controller.updateUrl("s", { newSlug: "n" } as any)).toBe("u");
  });

  it("getUrlAnalytics returns service result", async () => {
    mockService.getUrlAnalytics.mockResolvedValue("a");
    expect(await controller.getUrlAnalytics("s")).toBe("a");
  });
});
