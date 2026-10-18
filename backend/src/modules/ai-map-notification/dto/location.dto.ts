import { ArrayMaxSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ProductCategory } from '@prisma/client';

export class LocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userId: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(ProductCategory, { each: true })
  preferences?: ProductCategory[];
}
