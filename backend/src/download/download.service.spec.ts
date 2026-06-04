import { Test, TestingModule } from '@nestjs/testing';
import { DownloadService } from './download.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe("DownloadService", () => {
  let service: DownloadService;
  let prisma: PrismaService;
  let s3: S3Service;

  const mockPrismaService = {
    file: {
      findUnique: jest.fn(),
    },
  };

  const mockS3Service = {
    generatePresignedGetUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<DownloadService>(DownloadService);
    prisma = module.get<PrismaService>(PrismaService);
    s3 = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getPublicFileInfo", () => {
    it("devrait lever NotFoundException si le fichier n existe pas", async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);
      await expect(service.getPublicFileInfo('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it("devrait lever NotFoundException si le fichier est expire", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', expires_at: pastDate, status: 'ready'
      });
      await expect(service.getPublicFileInfo('1')).rejects.toThrow(NotFoundException);
    });

    it("devrait lever NotFoundException si le fichier n est pas ready", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', expires_at: futureDate, status: 'pending'
      });
      await expect(service.getPublicFileInfo('1')).rejects.toThrow(NotFoundException);
    });

    it("devrait retourner les infos publiques si le fichier est valide", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', original_name: 'test.mp4', size_bytes: 100, expires_at: futureDate, status: 'ready', password_hash: 'hashed'
      });
      
      const result = await service.getPublicFileInfo('1');
      expect(result.id).toBe('1');
      expect(result.original_name).toBe('test.mp4');
      expect(result.isProtected).toBe(true);
    });
  });

  describe("getDownloadUrl", () => {
    it("devrait lever ForbiddenException si protege et mot de passe manquant", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', expires_at: futureDate, status: 'ready', password_hash: 'hashed'
      });
      await expect(service.getDownloadUrl('1')).rejects.toThrow(ForbiddenException);
    });

    it("devrait lever ForbiddenException si le mot de passe est faux", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', expires_at: futureDate, status: 'ready', password_hash: 'hashed'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.getDownloadUrl('1', 'wrong')).rejects.toThrow(ForbiddenException);
    });

    it("devrait retourner une URL pre-signee si le fichier est public", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', expires_at: futureDate, status: 'ready', password_hash: null, s3_key: 's3-123', original_name: 'test.mp4'
      });
      mockS3Service.generatePresignedGetUrl.mockResolvedValue('https://s3/download');
      
      const result = await service.getDownloadUrl('1');
      expect(result).toBe('https://s3/download');
      expect(s3.generatePresignedGetUrl).toHaveBeenCalledWith('s3-123', 'test.mp4');
    });

    it("devrait retourner une URL pre-signee si protege et mot de passe correct", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      mockPrismaService.file.findUnique.mockResolvedValue({
        id: '1', expires_at: futureDate, status: 'ready', password_hash: 'hashed', s3_key: 's3-123', original_name: 'test.mp4'
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockS3Service.generatePresignedGetUrl.mockResolvedValue('https://s3/download');
      
      const result = await service.getDownloadUrl('1', 'correct');
      expect(result).toBe('https://s3/download');
    });
  });
});
