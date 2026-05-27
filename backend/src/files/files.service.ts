import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

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
}
