import { IsUrl, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUrlDto {
  @IsUrl()
  @ApiProperty({ example: "https://example.com" })
  longUrl: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "my-slug", required: false })
  customSlug?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "73eb6ede-6486-411c-8455-b43e86f3b183", required: false })
  userId?: string;
}
