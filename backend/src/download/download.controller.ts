import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { DownloadService } from './download.service';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { DownloadRequestSchema } from 'shared';
import type { DownloadRequestDto, PublicFileInfoDto, DownloadResponseDto } from 'shared';

@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Public()
  @Get(':id/public')
  async getPublicFileInfo(@Param('id') id: string): Promise<PublicFileInfoDto> {
    return this.downloadService.getPublicFileInfo(id);
  }

  @Public()
  @Post(':id/link')
  @HttpCode(200)
  async getDownloadUrl(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(DownloadRequestSchema)) body: DownloadRequestDto,
  ): Promise<DownloadResponseDto> {
    const url = await this.downloadService.getDownloadUrl(id, body.password);
    return { downloadUrl: url };
  }
}
