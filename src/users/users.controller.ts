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
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() body: unknown,
    @Headers('authorization') authorization: string,
  ) {
    return this.usersService.create(body, authorization);
  }

  @Get()
  findAll(@Headers('authorization') authorization: string) {
    return this.usersService.findAll(authorization);
  }
  @Get('my-sector')
  findMySector(@Headers('authorization') authorization: string) {
    return this.usersService.findMySector(authorization);
  }

  @Get('me')
  findMe(@Headers('authorization') authorization: string) {
    return this.usersService.findMe(authorization);
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
