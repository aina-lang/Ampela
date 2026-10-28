import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(80)
  username?: string;

  /** Spécialité (professionnelles de santé uniquement). */
  @IsOptional() @IsString() @MaxLength(120)
  profession?: string | null;

  @IsOptional() @IsString() @MaxLength(20)
  lastMenstruationDate?: string | null;

  @IsOptional() @IsInt() @Min(1) @Max(15)
  durationMenstruation?: number | null;

  @IsOptional() @IsInt() @Min(15) @Max(60)
  cycleDuration?: number | null;

  @IsOptional() @IsString() @MaxLength(500)
  profileImage?: string | null;
}
