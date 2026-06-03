import { Controller, Get, Delete, Param, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { FileResponseDto } from 'shared';

@ApiTags('Dashboard (Files)')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: "Lister les fichiers de l'utilisateur connecté" })
  @Get()
  async getMyFiles(@CurrentUser() userId: string): Promise<FileResponseDto[]> {
    return this.filesService.getUserFiles(userId);
  }

  @ApiOperation({ summary: 'Supprimer un fichier' })
  @Delete(':id')
  @HttpCode(204)
  async deleteMyFile(
    @Param('id') fileId: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.filesService.deleteUserFile(fileId, userId);
  }
}
