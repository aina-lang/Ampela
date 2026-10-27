import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class SendMessageDto {
  /** Texte (obligatoire sans pièce jointe, légende optionnelle sinon). */
  @ValidateIf((o: SendMessageDto) => !o.attachmentUrl)
  @IsString()
  @MaxLength(4000)
  text?: string;

  @IsOptional() @IsIn(['image', 'file', 'audio'])
  attachmentType?: 'image' | 'file' | 'audio';

  /** URL renvoyée par POST /uploads ou /uploads/file. */
  @IsOptional() @IsUrl({ require_tld: false }) @MaxLength(500)
  attachmentUrl?: string;

  @IsOptional() @IsString() @MaxLength(255)
  attachmentName?: string;

  @IsOptional() @IsInt() @Min(0)
  attachmentSize?: number;

  @IsOptional() @IsInt() @Min(0)
  durationMs?: number;
}
