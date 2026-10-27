import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '../auth/auth.guard';

/** Images (avatars, photos de posts et de messages). */
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Pièces jointes de la messagerie : documents courants et messages vocaux. */
const FILE_EXT = new Set([
  ...IMAGE_EXT,
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
  '.m4a', '.mp4', '.aac', '.mp3', '.ogg', '.opus', '.wav', '.3gp', '.webm', '.amr',
]);
const FILE_MIME_PREFIXES = ['image/', 'audio/', 'video/mp4', 'application/pdf', 'text/plain', 'text/csv'];
const FILE_MIME = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream', // certains sélecteurs Android ne renseignent pas le type
]);
// Même limite que nginx (client_max_body_size 10m).
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Ce que multer fournit au filtre et au stockage (avant écriture sur disque). */
type IncomingFile = { originalname?: string; mimetype?: string };

const extOf = (file: IncomingFile) => extname(file.originalname ?? '').toLowerCase();

/** Image : extension ET type MIME d'image. */
const isImage = (file: IncomingFile) =>
  IMAGE_EXT.has(extOf(file)) && IMAGE_MIME.has((file.mimetype ?? '').toLowerCase());

/**
 * Pièce jointe : extension connue, et type MIME cohérent (ou absent /
 * générique, fréquent avec les sélecteurs de fichiers mobiles).
 */
const isAllowedFile = (file: IncomingFile) => {
  const ext = extOf(file);
  if (!FILE_EXT.has(ext)) return false;
  const mime = (file.mimetype ?? '').toLowerCase();
  return (
    !mime ||
    FILE_MIME.has(mime) ||
    FILE_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))
  );
};

/** Nom de fichier stocké : identifiant aléatoire + extension d'origine (jamais le nom fourni). */
const storage = diskStorage({
  destination: 'uploads',
  filename: (_req, file, cb) => cb(null, `${randomUUID()}${extOf(file)}`),
});

@Controller('uploads')
@UseGuards(AuthGuard)
export class UploadsController {
  /** Reçoit une image (champ "file") et renvoie son URL publique. */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES },
      storage,
      fileFilter: (_req, file, cb) => cb(null, isImage(file)),
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Image manquante ou format refusé.');
    return this.describe(file);
  }

  /** Document ou message vocal (champ "file") pour la messagerie. */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_BYTES },
      storage,
      fileFilter: (_req, file, cb) => cb(null, isAllowedFile(file)),
    }),
  )
  uploadFile(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Fichier manquant ou format refusé (PDF, Word, Excel, PowerPoint, texte, image ou audio, 10 Mo max).',
      );
    }
    return this.describe(file);
  }

  private describe(file: Express.Multer.File) {
    const base = (process.env.PUBLIC_URL ?? '').replace(/\/$/, '');
    return {
      url: `${base}/uploads/${file.filename}`,
      path: `/uploads/${file.filename}`,
      name: file.originalname,
      size: file.size,
      mime: file.mimetype,
    };
  }
}
