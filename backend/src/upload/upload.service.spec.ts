import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe("UploadService", () => {
  let service: UploadService;
  let prisma: PrismaService;
  let s3: S3Service;

  const mockPrismaService = {
    file: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockS3Service = {
    generatePresignedPutUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    prisma = module.get<PrismaService>(PrismaService);
    s3 = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initUpload", () => {
    it("devrait creer un fichier en attente et renvoyer une URL pre-signee", async () => {
      const dto = {
        originalName: 'test.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 100,
        expiresInDays: 3,
      };
      mockPrismaService.file.create.mockResolvedValue({ id: 'file-123' });
      mockS3Service.generatePresignedPutUrl.mockResolvedValue('https://s3.aws.com/upload-link');

      const result = await service.initUpload(dto, 'user-id');

      expect(prisma.file.create).toHaveBeenCalled();
      const createArgs = mockPrismaService.file.create.mock.calls[0][0].data;
      expect(createArgs.original_name).toBe('test.mp4');
      expect(createArgs.status).toBe('pending');
      expect(createArgs.user_id).toBe('user-id');
      expect(createArgs.password_hash).toBeNull();
      
      expect(s3.generatePresignedPutUrl).toHaveBeenCalled();
      expect(result).toEqual({ fileId: 'file-123', presignedUrl: 'https://s3.aws.com/upload-link' });
    });

    it("devrait hasher le mot de passe s il est fourni", async () => {
      const dto = { originalName: 'test.mp4', mimeType: 'video/mp4', sizeBytes: 100, password: 'secret' };
      mockPrismaService.file.create.mockResolvedValue({ id: 'file-123' });
      mockS3Service.generatePresignedPutUrl.mockResolvedValue('url');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-secret');

      await service.initUpload(dto);

      const createArgs = mockPrismaService.file.create.mock.calls[0][0].data;
      expect(createArgs.password_hash).toBe('hashed-secret');
    });
  });

  describe("completeUpload", () => {
    it("devrait mettre a jour le statut du fichier en ready", async () => {
      mockPrismaService.file.update.mockResolvedValue({ id: 'file-123', status: 'ready' });
      const result = await service.completeUpload('file-123');
      expect(prisma.file.update).toHaveBeenCalledWith({
        where: { id: 'file-123' },
        data: { status: 'ready' },
      });
      expect(result.status).toBe('ready');
    });
  });
});
