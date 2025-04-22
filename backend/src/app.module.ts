import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { UrlsModule } from "./urls/urls.module";
import { PrismaService } from "./prisma/prisma.service";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    UrlsModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class AppModule {}
