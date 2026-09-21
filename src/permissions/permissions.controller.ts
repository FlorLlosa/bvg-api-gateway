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

import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll(@Headers('authorization') authorization: string) {
    return this.permissionsService.findAll(authorization);
  }
  @Get('roles/:roleId')
  findByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Headers('authorization') authorization: string,
  ) {
    return this.permissionsService.findByRole(roleId, authorization);
  }
  @Patch(':permissionId/roles/:roleId')
  assignToRole(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Headers('authorization') authorization: string,
  ) {
    return this.permissionsService.assignToRole(
      permissionId,
      roleId,
      authorization,
    );
  }
  @Post()
  create(
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.permissionsService.create(body, authorization);
  }
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization: string,
  ) {
    return this.permissionsService.findOne(id, authorization);
  }
}
