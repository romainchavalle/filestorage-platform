import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import * as bcrypt from 'bcryptjs';
import type { PublicFileInfoDto } from 'shared';

@Injectable()
export class DownloadService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
  ) {}

  // --- SOUS-FONCTION PRIVÉE RÉUTILISABLE ---
  private async getValidFileOrThrow(fileId: string) {
    const file = await this.prisma.file.findUnique({ where: { id: fileId } });
    
    if (!file) {
      throw new NotFoundException('Ce fichier est introuvable ou a été supprimé.');
    }
    
    if (new Date(file.expires_at) < new Date() || file.status !== 'ready') {
      throw new NotFoundException('Ce fichier n\'est plus disponible.');
    }
    
    return file;
  }

  // --- ROUTE 1 : Affichage de la page ---
  async getPublicFileInfo(fileId: string): Promise<PublicFileInfoDto> {
    const file = await this.getValidFileOrThrow(fileId);
    
    return {
      id: file.id,
      original_name: file.original_name,
      size_bytes: file.size_bytes,
      expires_at: file.expires_at.toISOString(),
      isProtected: !!file.password_hash,
    };
  }

  // --- ROUTE 2 : Déclenchement du téléchargement ---
  async getDownloadUrl(fileId: string, password?: string): Promise<string> {
    const file = await this.getValidFileOrThrow(fileId);

    // Vérification de sécurité bcrypt
    if (file.password_hash) {
      if (!password) {
        throw new ForbiddenException('Ce fichier est protégé par un mot de passe.');
      }
      
      const isPasswordValid = await bcrypt.compare(password, file.password_hash);
      if (!isPasswordValid) {
        throw new ForbiddenException('Le mot de passe est invalide');
      }
    }

    // Succès : Génération de l'URL AWS S3 pré-signée
    return this.s3Service.generatePresignedGetUrl(file.s3_key, file.original_name);
  }
}
