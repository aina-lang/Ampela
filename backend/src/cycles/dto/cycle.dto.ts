import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CycleDto {
  @IsString() @MaxLength(40) month!: string;
  @IsString() @MaxLength(20) ovulationDate!: string;
  @IsString() @MaxLength(20) fecundityPeriodStart!: string;
  @IsString() @MaxLength(20) fecundityPeriodEnd!: string;
  @IsString() @MaxLength(20) startMenstruationDate!: string;
  @IsString() @MaxLength(20) endMenstruationDate!: string;
  @IsString() @MaxLength(20) nextMenstruationStartDate!: string;
  @IsString() @MaxLength(20) nextMenstruationEndDate!: string;
}

export class UpsertCyclesDto {
  @IsArray()
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => CycleDto)
  cycles!: CycleDto[];

  /** true : les cycles absents de l'envoi sont supprimés (jeu complet). */
  @IsOptional() @IsBoolean()
  replace?: boolean;

  /**
   * Horodatage (ISO) du jeu de cycles local. Plus ancien que celui
   * enregistré → l'envoi est ignoré (réponse { skipped: true }).
   */
  @IsOptional() @IsDateString()
  updatedAt?: string;
}
