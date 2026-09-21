import { Body, Controller, Post } from '@nestjs/common';
import { SectorsService } from './sectors.service';

@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  create(@Body() data: unknown) {
    return this.sectorsService.create(data);
  }
}
