import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Headers('authorization') authorization: string) {
    return this.usersService.findAll(authorization);
  }
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('authorization') authorization: string,
  ) {
    return this.usersService.findOne(id, authorization);
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.usersService.update(id, body, authorization);
  }
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.usersService.updateStatus(id, body, authorization);
  }
}
