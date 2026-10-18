import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory, OfferStatus } from '@prisma/client';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  originalPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  discountedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  itemsLeft?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  expiresInMinutes?: number;

  @IsOptional()
  @IsString()
  pickupWindow?: string;

  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
