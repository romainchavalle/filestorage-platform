import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { UploadInitDto } from 'shared';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async initUpload(dto: UploadInitDto, userId?: string) {
    const s3Key = randomUUID();
    const passwordHash = await this.hashPasswordIfPresent(dto.password);
    const expiresAt = this.calculateExpirationDate(dto.expiresInDays);

    const file = await this.savePendingFileToDatabase(dto, s3Key, passwordHash, expiresAt, userId);
    const presignedUrl = await this.s3Service.generatePresignedPutUrl(s3Key, dto.mimeType);

    return {
      fileId: file.id,
      presignedUrl,
    };
  }

  async completeUpload(fileId: string) {
    const file = await this.prisma.file.update({
      where: { id: fileId },
      data: { status: 'ready' },
    });
    return file;
  }

  private async hashPasswordIfPresent(password?: string): Promise<string | null> {
    if (!password) return null;
    return bcrypt.hash(password, 10);
  }

  private calculateExpirationDate(days: number = 7): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private async savePendingFileToDatabase(
    dto: UploadInitDto,
    s3Key: string,
    passwordHash: string | null,
    expiresAt: Date,
    userId?: string
  ) {
    return this.prisma.file.create({
      data: {
        original_name: dto.originalName,
        mime_type: dto.mimeType,
        size_bytes: dto.sizeBytes,
        s3_key: s3Key,
        status: 'pending',
        password_hash: passwordHash,
        expires_at: expiresAt,
        user_id: userId || null,
        tags: dto.tags?.length ? {
          create: dto.tags.map(tagName => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: { name: tagName }
              }
            }
          }))
        } : undefined,
      },
    });
  }
}
