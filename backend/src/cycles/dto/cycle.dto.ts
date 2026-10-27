import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsString, MaxLength, ValidateNested } from 'class-validator';

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
}
