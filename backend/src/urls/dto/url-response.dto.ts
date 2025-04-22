export class UrlResponseDto {
  id: string;
  longUrl: string;
  slug: string;
  shortUrl: string;
  createdAt: Date;
  visitCount?: number;
}
