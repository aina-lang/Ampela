import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDoctorDto {
  /** Code d'invitation remis par l'équipe Ampela. */
  @IsString() @MinLength(4) @MaxLength(32)
  code!: string;

  @IsString() @MinLength(1) @MaxLength(80)
  username!: string;

  /** Spécialité (sage-femme, gynécologue…). */
  @IsString() @MinLength(1) @MaxLength(120)
  profession!: string;

  @IsOptional() @IsString() @MaxLength(120)
  fullName?: string | null;

  @IsOptional() @IsString() @MaxLength(160)
  institution?: string | null;

  @IsOptional() @IsString() @MaxLength(80)
  licenseNumber?: string | null;

  @IsOptional() @IsString() @MaxLength(500)
  profileImage?: string | null;
}
