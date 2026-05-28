import { z } from 'zod';

// 1. Schéma d'ENTRÉE : Quand le destinataire envoie le mot de passe
export const DownloadRequestSchema = z.object({
  password: z.string().optional(),
});

export type DownloadRequestDto = z.infer<typeof DownloadRequestSchema>;

// 2. Schéma de SORTIE : Ce que le Backend renvoie au Frontend pour afficher la page
export interface PublicFileInfoDto {
  id: string;
  original_name: string;
  size_bytes: number;
  expires_at: string;
  isProtected: boolean;
}

// 3. Schéma de SORTIE (Succès) : L'URL finale
export interface DownloadResponseDto {
  downloadUrl: string;
}
