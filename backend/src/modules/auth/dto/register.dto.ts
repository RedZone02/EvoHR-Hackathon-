import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, ProductCategory } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Adresa de email este invalidă.' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Parola trebuie să aibă minim 8 caractere pentru securitate.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Numele complet / reprezentant este obligatoriu.' })
  name: string;

  @IsEnum(Role, { message: 'Rolul trebuie să fie CLIENT sau PARTNER.' })
  role: Role;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  // Câmpuri obligatorii dacă role === PARTNER
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  cui?: string;

  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @IsOptional()
  @IsString()
  categoryLabel?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;
}
