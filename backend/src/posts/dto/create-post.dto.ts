import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString() @MinLength(1) @MaxLength(200)
  title!: string;

  @IsString() @MinLength(1) @MaxLength(5000)
  description!: string;

  @IsOptional() @IsString() @MaxLength(500)
  photos?: string | null;
}

export class CreateCommentDto {
  @IsString() @MinLength(1) @MaxLength(2000)
  content!: string;

  /** Identifiant du commentaire auquel on répond (optionnel). */
  @IsOptional() @IsUUID()
  parentId?: string | null;
}

export class UpdateCommentDto {
  @IsString() @MinLength(1) @MaxLength(2000)
  content!: string;
}
