import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateUrlDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  longUrl: string;

  @ApiProperty()
  shortUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  visitCount?: number;

  @IsString()
  @ApiProperty({ example: "new-slug" })
  newSlug: string;
}
