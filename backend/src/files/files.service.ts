import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  async getUserFiles(userId: string) {
    const files = await this.prisma.file.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return files.map((file) => {
      const { password_hash, tags, ...safeData } = file;
      
      // On simplifie la structure des tags renvoyée par Prisma
      const flattenedTags = tags.map((fileTag) => fileTag.tag.name);

      return {
        ...safeData,
        tags: flattenedTags,
        isProtected: !!password_hash,
      };
    });
  }

  async deleteUserFile(fileId: string, userId: string): Promise<void> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('Fichier introuvable');
    }

    if (file.user_id !== userId) {
      throw new ForbiddenException("Vous n'avez pas le droit de supprimer ce fichier");
    }

    await this.s3Service.deleteFile(file.s3_key);

    await this.prisma.file.delete({
      where: { id: fileId },
    });
  }
}
