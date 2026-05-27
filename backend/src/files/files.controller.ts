import { Controller, Get } from '@nestjs/common';
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
}
