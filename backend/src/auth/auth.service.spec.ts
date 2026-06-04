import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait etre defini", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    it("devrait lever une ConflictException si l email existe deja", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(service.register('test@test.com', 'pass')).rejects.toThrow(ConflictException);
    });

    it("devrait hasher le mot de passe et creer l utilisateur", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({ id: 'uuid-1', email: 'test@test.com', password_hash: 'hashed' });
      
      const result = await service.register('test@test.com', 'pass123');
      
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'uuid-1', email: 'test@test.com' });
    });
  });

  describe("login", () => {
    it("devrait lever une UnauthorizedException si l utilisateur n est pas trouve", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it("devrait lever une UnauthorizedException si le mot de passe est invalide", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password_hash: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@test.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it("devrait retourner un access_token si la connexion reussit", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', password_hash: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login('test@test.com', 'correctpass');
      expect(result).toEqual({ access_token: 'jwt-token' });
      expect(jwt.sign).toHaveBeenCalledWith({ sub: '1' });
    });
  });
});
