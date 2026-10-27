import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  // Fichiers envoyés par les utilisatrices (photos de posts, avatars).
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });
  // Pages publiques exigées par les stores : /privacy et /account-deletion
  // (dossier public/<page>/index.html).
  app.useStaticAssets(join(process.cwd(), 'public'), { prefix: '/' });
  app.enableShutdownHooks();
  await app.listen(Number(process.env.PORT ?? 3200), '127.0.0.1');
}
void bootstrap();
