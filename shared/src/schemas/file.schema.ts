import { z } from 'zod';

// POST /api/files/:id/download
export const DownloadRequestSchema = z.object({
  password: z.string().optional(),
});

// Type inféré
export type DownloadRequestDto = z.infer<typeof DownloadRequestSchema>;
