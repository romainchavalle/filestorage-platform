import { Controller, Post, Patch, Param, Body, UsePipes } from '@nestjs/common';
import { UploadService } from './upload.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UploadInitSchema, UploadInitDto } from 'shared';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public() // Accessible aux connectés ET anonymes
  @Post('init')
  @UsePipes(new ZodValidationPipe(UploadInitSchema))
  async init(
    @Body() dto: UploadInitDto,
    @CurrentUser() userId?: string,
  ) {
    return this.uploadService.initUpload(dto, userId);
  }

  @Public()
  @Patch('complete/:id')
  async complete(@Param('id') id: string) {
    return this.uploadService.completeUpload(id);
  }
}
