import { Module } from "@nestjs/common";
import { UrlsController } from "./urls.controller";
import { UrlsService } from "./urls.service";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [UrlsController],
  providers: [UrlsService, PrismaService],
  exports: [UrlsService],
})
export class UrlsModule {}
