import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { S3Service } from '../src/s3/s3.service';

describe("DataShare App (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let createdFileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(S3Service)
    .useValue({
      generatePresignedPutUrl: jest.fn().mockResolvedValue('https://mock-s3.aws.com/upload'),
      generatePresignedGetUrl: jest.fn().mockResolvedValue('https://mock-s3.aws.com/download'),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await prisma.fileTag.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.file.deleteMany();
    await prisma.user.deleteMany();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("1. Sécurité et Authentification", () => {
    it("/files (GET) - Bloqué sans token (401)", () => {
      return request(app.getHttpServer())
        .get('/files')
        .expect(401);
    });

    it("/auth/register (POST) - Crée un utilisateur (201)", async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'e2e@test.com',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('e2e@test.com');
    });

    it("/auth/login (POST) - Connecte l utilisateur et renvoie le JWT (201)", async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e@test.com',
          password: 'Password123!',
        });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
      jwtToken = res.body.access_token;
    });
  });

  describe("2. Validation Zod et Upload", () => {
    it("/upload/init (POST) - Rejeté si payload invalide (400)", () => {
      return request(app.getHttpServer())
        .post('/upload/init')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ originalName: 'video.mp4' })
        .expect(400);
    });

    it("/upload/init (POST) - Succès avec payload valide (201)", async () => {
      const res = await request(app.getHttpServer())
        .post('/upload/init')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ 
          originalName: 'video.mp4',
          mimeType: 'video/mp4',
          sizeBytes: 5000000,
          expiresInDays: 3,
          tags: ['vacances']
        });
        
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('fileId');
      expect(res.body).toHaveProperty('presignedUrl');
      createdFileId = res.body.fileId;
    });
    
    it("/upload/complete/:id (PATCH) - Valide l upload (200)", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/upload/complete/${createdFileId}`)
        .set('Authorization', `Bearer ${jwtToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
    });
  });

  describe("3. Consultation et Téléchargement", () => {
    it("/files (GET) - Liste les fichiers de l utilisateur (200)", async () => {
      const res = await request(app.getHttpServer())
        .get('/files')
        .set('Authorization', `Bearer ${jwtToken}`);
        
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(createdFileId);
    });
    
    it("/download/:id/public (GET) - Renvoie les infos publiques (200)", async () => {
      const res = await request(app.getHttpServer())
        .get(`/download/${createdFileId}/public`);
        
      expect(res.status).toBe(200);
      expect(res.body.original_name).toBe('video.mp4');
    });
    
    it("/download/:id/link (POST) - Génère le lien de téléchargement (200)", async () => {
      const res = await request(app.getHttpServer())
        .post(`/download/${createdFileId}/link`)
        .send({});
        
      expect(res.status).toBe(200);
      expect(res.body.downloadUrl).toBe('https://mock-s3.aws.com/download');
    });
  });
});
