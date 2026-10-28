import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ReminderDto {
  @IsString() @MaxLength(60) name!: string;
  @IsBoolean() enabled!: boolean;
  @IsInt() @Min(0) @Max(23) hour!: number;
  @IsInt() @Min(0) @Max(59) minute!: number;
  @IsString() @MaxLength(40) frequency!: string;
  /** Horodatage (ISO) de la dernière modification sur l'appareil. */
  @IsDateString() updatedAt!: string;
}

export class SyncRemindersDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ReminderDto)
  reminders!: ReminderDto[];
}
