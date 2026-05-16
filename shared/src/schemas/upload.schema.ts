import { z } from 'zod';

// Extensions de fichiers interdites (sécurité)
const FORBIDDEN_EXTENSIONS = ['.exe', '.bat', '.cmd', '.msi', '.scr', '.ps1', '.vbs', '.js'];

// POST /api/upload/init
export const UploadInitSchema = z.object({
  originalName: z
    .string()
    .min(1, 'Le nom du fichier est requis')
    .refine(
      (name) => !FORBIDDEN_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
      { message: 'Ce type de fichier n\'est pas autorisé' },
    ),
  mimeType: z.string().min(1, 'Le type MIME est requis'),
  sizeBytes: z
    .number()
    .int()
    .positive('La taille doit être positive')
    .max(1_073_741_824, 'La taille maximale est de 1 Go'),
  tags: z.array(z.string().max(30, 'Un tag ne peut pas dépasser 30 caractères')).max(10).optional(),
  password: z.string().min(6, 'Le mot de passe doit faire au moins 6 caractères').optional(),
  expiresInDays: z.number().int().min(1).max(7, 'La durée maximale est de 7 jours').optional().default(7),
});

// Exporter la liste pour réutilisation (ex: filtrage côté front)
export const UPLOAD_FORBIDDEN_EXTENSIONS = FORBIDDEN_EXTENSIONS;

// Type inféré
export type UploadInitDto = z.infer<typeof UploadInitSchema>;
