import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/guards/auth.guard';

import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_CREATE')
  create(@Body() data: unknown) {
    return this.tasksService.create(data);
  }
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findAll() {
    return this.tasksService.findAll();
  }
  @Get('assigned/:userId')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findByAssignedUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.tasksService.findByAssignedUser(userId);
  }
  @Post('templates')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_CREATE')
  createTemplate(@Body() data: unknown) {
    return this.tasksService.createTemplate(data);
  }
  @Get('templates/:id')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findTemplate(id);
  }
  @Post('templates/:templateId/items')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_CREATE')
  addTemplateItem(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() data: unknown,
  ) {
    return this.tasksService.addTemplateItem(templateId, data);
  }
  @Post('templates/:templateId/create-task')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_CREATE')
  createFromTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() data: unknown,
  ) {
    return this.tasksService.createFromTemplate(templateId, data);
  }
  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }
  @Post(':id/items')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  addItem(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.addItem(id, data);
  }
  @Patch(':taskId/items/:itemId/complete')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  completeItem(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.tasksService.completeItem(taskId, itemId);
  }
  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.updateStatus(id, data);
  }
  @Patch(':id/assign')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_ASSIGN')
  assign(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.assign(id, data);
  }
  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.update(id, data);
  }
}
