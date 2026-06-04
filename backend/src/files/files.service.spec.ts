import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe("FilesService", () => {
  let service: FilesService;
  let prisma: PrismaService;
  let s3: S3Service;

  const mockPrismaService = {
    file: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockS3Service = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prisma = module.get<PrismaService>(PrismaService);
    s3 = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserFiles", () => {
    it("devrait retourner la liste des fichiers formatee", async () => {
      mockPrismaService.file.findMany.mockResolvedValue([
        { id: '1', password_hash: 'hashed', tags: [{ tag: { name: 'vacances' } }] },
        { id: '2', password_hash: null, tags: [] },
      ]);

      const result = await service.getUserFiles('user-1');
      expect(result.length).toBe(2);
      expect(result[0].isProtected).toBe(true);
      expect(result[0].tags).toEqual(['vacances']);
      expect(result[1].isProtected).toBe(false);
      expect(result[1].tags).toEqual([]);
    });
  });

  describe("deleteUserFile", () => {
    it("devrait lever une erreur si le fichier n existe pas", async () => {
      mockPrismaService.file.findUnique.mockResolvedValue(null);
      await expect(service.deleteUserFile('invalid-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it("devrait lever une erreur si l utilisateur n est pas le proprietaire", async () => {
      mockPrismaService.file.findUnique.mockResolvedValue({ id: '1', user_id: 'user-2' });
      await expect(service.deleteUserFile('1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it("devrait supprimer le fichier sur S3 et en BDD", async () => {
      mockPrismaService.file.findUnique.mockResolvedValue({ id: '1', user_id: 'user-1', s3_key: 'key-1' });
      mockS3Service.deleteFile.mockResolvedValue(undefined);
      mockPrismaService.file.delete.mockResolvedValue(undefined);

      await service.deleteUserFile('1', 'user-1');
      expect(s3.deleteFile).toHaveBeenCalledWith('key-1');
      expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
