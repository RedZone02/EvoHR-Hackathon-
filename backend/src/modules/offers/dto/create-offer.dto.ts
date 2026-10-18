import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory, OfferStatus } from '@prisma/client';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty({ message: 'Titlul ofertei este obligatoriu.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrierea ofertei este obligatorie.' })
  description: string;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsString()
  @IsNotEmpty()
  categoryLabel: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsNumber()
  @IsPositive({ message: 'Prețul inițial trebuie să fie pozitiv.' })
  originalPrice: number;

  @IsNumber()
  @IsPositive({ message: 'Prețul redus trebuie să fie pozitiv.' })
  discountedPrice: number;

  @IsNumber()
  @Min(1, { message: 'Numărul de bucăți trebuie să fie minim 1.' })
  itemsLeft: number;

  @IsNumber()
  @Min(15, { message: 'Timpul de expirare trebuie să fie de minim 15 minute.' })
  expiresInMinutes: number;

  @IsString()
  @IsNotEmpty({ message: 'Intervalul de ridicare este obligatoriu.' })
  pickupWindow: string;

  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
