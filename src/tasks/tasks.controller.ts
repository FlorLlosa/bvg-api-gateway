import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() data: unknown) {
    return this.tasksService.create(data);
  }
  @Get()
  findAll() {
    return this.tasksService.findAll();
  }
  @Get('assigned/:userId')
  findByAssignedUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.tasksService.findByAssignedUser(userId);
  }
  @Post('templates')
  createTemplate(@Body() data: unknown) {
    return this.tasksService.createTemplate(data);
  }
  @Get('templates/:id')
  findTemplate(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findTemplate(id);
  }
  @Post('templates/:templateId/items')
  addTemplateItem(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() data: unknown,
  ) {
    return this.tasksService.addTemplateItem(templateId, data);
  }
  @Post('templates/:templateId/create-task')
  createFromTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() data: unknown,
  ) {
    return this.tasksService.createFromTemplate(templateId, data);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }
  @Post(':id/items')
  addItem(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.addItem(id, data);
  }
  @Patch(':taskId/items/:itemId/complete')
  completeItem(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.tasksService.completeItem(taskId, itemId);
  }
  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.updateStatus(id, data);
  }
  @Patch(':id/assign')
  assign(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.assign(id, data);
  }
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: unknown) {
    return this.tasksService.update(id, data);
  }
}
