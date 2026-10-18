import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Adresa de email este invalidă.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Parola este obligatorie.' })
  password: string;
}
