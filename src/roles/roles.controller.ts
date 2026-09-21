import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll(@Headers('authorization') authorization: string) {
    return this.rolesService.findAll(authorization);
  }
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization: string,
  ) {
    return this.rolesService.findOne(id, authorization);
  }
  @Post()
  create(
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.rolesService.create(body, authorization);
  }
  @Patch('users/:userId')
  assignRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.rolesService.assignRole(userId, body, authorization);
  }
}
