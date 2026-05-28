import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { S3Module } from './s3/s3.module';
import { UploadModule } from './upload/upload.module';
import { FilesModule } from './files/files.module';
import { DownloadModule } from './download/download.module';

@Module({
  imports: [
    // Charge le fichier .env et rend ConfigService disponible partout
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    S3Module,
    UploadModule,
    FilesModule,
    DownloadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
