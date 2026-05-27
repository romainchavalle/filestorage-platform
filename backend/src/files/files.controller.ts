import { Controller, Get, Delete, Param, HttpCode } from '@nestjs/common';
import { FilesService } from './files.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { FileResponseDto } from 'shared';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getMyFiles(@CurrentUser() userId: string): Promise<FileResponseDto[]> {
    return this.filesService.getUserFiles(userId);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteMyFile(
    @Param('id') fileId: string,
    @CurrentUser() userId: string,
  ): Promise<void> {
    await this.filesService.deleteUserFile(fileId, userId);
  }
}
