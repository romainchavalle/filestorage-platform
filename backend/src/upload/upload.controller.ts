import { Controller, Post, Patch, Param, Body, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UploadInitSchema } from 'shared';
import type { UploadInitDto, UploadInitResponseDto } from 'shared';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public() // Accessible aux connectés ET anonymes
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initialiser un upload (Demande URL S3)' })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        originalName: 'video.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 10485760,
        tags: ['vacances', 'famille'],
        password: 'secret',
        expiresInDays: 7
      }
    }
  })
  @Post('init')
  async init(
    @Body(new ZodValidationPipe(UploadInitSchema)) dto: UploadInitDto,
    @CurrentUser() userId?: string,
  ): Promise<UploadInitResponseDto> {
    return this.uploadService.initUpload(dto, userId);
  }

  @Public()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirmer la fin de l'upload" })
  @Patch('complete/:id')
  async complete(@Param('id') id: string) {
    return this.uploadService.completeUpload(id);
  }
}
