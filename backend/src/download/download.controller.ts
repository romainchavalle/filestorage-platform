import { Controller, Get, Post, Param, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { DownloadService } from './download.service';
import { Public } from '../common/decorators/public.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { DownloadRequestSchema } from 'shared';
import type { DownloadRequestDto, PublicFileInfoDto, DownloadResponseDto } from 'shared';

@ApiTags('Download')
@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Public()
  @ApiOperation({ summary: "Obtenir les informations publiques d'un fichier partagé" })
  @Get(':id/public')
  async getPublicFileInfo(@Param('id') id: string): Promise<PublicFileInfoDto> {
    return this.downloadService.getPublicFileInfo(id);
  }

  @Public()
  @ApiOperation({ summary: "Générer l'URL AWS de téléchargement direct" })
  @ApiBody({
    schema: {
      type: 'object',
      example: {
        password: 'secret'
      }
    }
  })
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
