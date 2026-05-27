import { z } from 'zod';

// POST /api/files/:id/download
export const DownloadRequestSchema = z.object({
  password: z.string().optional(),
});

// Type inféré
export type DownloadRequestDto = z.infer<typeof DownloadRequestSchema>;

// GET /api/files (Response)
export const FileResponseSchema = z.object({
  id: z.string(),
  original_name: z.string(),
  mime_type: z.string(),
  size_bytes: z.number(),
  status: z.string(),
  created_at: z.string().or(z.date()),
  expires_at: z.string().or(z.date()),
  isProtected: z.boolean(),
  tags: z.array(z.string()),
});

export type FileResponseDto = z.infer<typeof FileResponseSchema>;
