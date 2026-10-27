import { IsEmail, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  email!: string;

  @Matches(/^\d{6}$/, { message: 'Le code contient 6 chiffres.' })
  code!: string;
}
