import { IsEmail } from 'class-validator';

export class RequestOtpDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  email!: string;
}
