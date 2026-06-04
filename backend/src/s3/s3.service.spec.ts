import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn().mockResolvedValue('https://mocked-url.com'),
  };
});

describe("S3Service", () => {
  let service: S3Service;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'AWS_BUCKET_NAME') return 'my-bucket';
      if (key === 'AWS_REGION') return 'eu-west-3';
      return 'secret';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait generer une URL pre-signee PUT", async () => {
    const result = await service.generatePresignedPutUrl('key-1', 'video/mp4');
    expect(result).toBe('https://mocked-url.com');
  });

  it("devrait generer une URL pre-signee GET", async () => {
    const result = await service.generatePresignedGetUrl('key-1', 'test.mp4');
    expect(result).toBe('https://mocked-url.com');
  });

  it("devrait supprimer un fichier sur S3", async () => {
    const s3ClientSendMock = (service as any).s3Client.send;
    s3ClientSendMock.mockResolvedValue(undefined);
    
    await service.deleteFile('key-1');
    expect(s3ClientSendMock).toHaveBeenCalled();
  });
  
  it("devrait remonter l erreur en cas d echec de suppression", async () => {
    const s3ClientSendMock = (service as any).s3Client.send;
    s3ClientSendMock.mockRejectedValue(new Error('S3 Error'));
    
    await expect(service.deleteFile('key-1')).rejects.toThrow('S3 Error');
  });
});
