import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty({ message: 'ID-ul ofertei este obligatoriu.' })
  offerId: string;
}
