import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

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

  /**
   * Horodatage (ISO) de la modification locale du profil. S'il est plus
   * ancien que celui déjà enregistré, les champs du profil sont ignorés :
   * un appareil en retard n'écrase jamais une modification plus récente.
   */
  @IsOptional() @IsDateString()
  profileUpdatedAt?: string;

  /** Préférences synchronisées (langue, thème), même règle d'horodatage. */
  @IsOptional() @IsObject()
  preferences?: Record<string, unknown>;

  @IsOptional() @IsDateString()
  preferencesUpdatedAt?: string;
}
