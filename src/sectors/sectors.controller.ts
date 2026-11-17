import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { SectorsService } from './sectors.service';

@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  // Crear un sector
  @Post()
  create(@Body() data: unknown) {
    return this.sectorsService.create(data);
  }

  // Obtener todos los sectores
  @Get()
  findAll() {
    return this.sectorsService.findAll();
  }

  // Obtener un sector por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectorsService.findOne(id);
  }
}
