import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  private requireManagementRole(request: AuthenticatedRequest): void {
    if (request.user.roleId === 2) {
      throw new ForbiddenException(
        'Esta operación no está permitida para empleados',
      );
    }
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_CREATE')
  create(
    @Body() data: unknown,
    @Req() request: AuthenticatedRequest,
    @Headers('authorization') authorization: string,
  ) {
    return this.tasksService.create(data, request.user.userId, authorization);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findAll(@Req() request: AuthenticatedRequest) {
    this.requireManagementRole(request);
    return this.tasksService.findAll();
  }

  @Get('my-sector')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findMySector(@Headers('authorization') authorization: string) {
    return this.tasksService.findMySector(authorization);
  }

  @Get('assigned/:userId')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_READ')
  findByAssignedUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    const authenticatedUser = request.user;

    if (authenticatedUser.roleId === 2 && authenticatedUser.userId !== userId) {
      throw new ForbiddenException(
        'No podés consultar las tareas de otro empleado',
      );
    }

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
  findTemplate(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireManagementRole(request);

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
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
  ): Promise<unknown> {
    const task: unknown = await this.tasksService.findOne(id);

    if (request.user.roleId === 2) {
      if (
        typeof task !== 'object' ||
        task === null ||
        !('assignedUserId' in task) ||
        task.assignedUserId !== request.user.userId
      ) {
        throw new ForbiddenException(
          'No podés consultar una tarea asignada a otro empleado',
        );
      }
    }

    return task;
  }

  @Post(':id/items')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireManagementRole(request);

    return this.tasksService.addItem(id, data);
  }

  @Patch(':taskId/items/:itemId/complete')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  completeItem(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireManagementRole(request);

    return this.tasksService.completeItem(taskId, itemId);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    const actorUserId = request.user.userId;
    const roleId = request.user.roleId;

    if (roleId === 2) {
      const task = (await this.tasksService.findOne(id)) as {
        id: number;
        assignedUserId: number | null;
        status: string;
      };

      if (task.assignedUserId !== actorUserId) {
        throw new ForbiddenException(
          'No podés modificar una tarea asignada a otro empleado',
        );
      }

      if (
        typeof data !== 'object' ||
        data === null ||
        Array.isArray(data) ||
        !('status' in data) ||
        data.status !== 'COMPLETED' ||
        Object.keys(data).length !== 1
      ) {
        throw new ForbiddenException(
          'El empleado solamente puede marcar sus tareas como completadas',
        );
      }
    }

    const updatedTask: unknown = await this.tasksService.updateStatus(
      id,
      data,
      actorUserId,
      roleId,
    );

    return updatedTask;
  }

  @Patch(':id/assign')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_ASSIGN')
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    const actorUserId = request.user.userId;

    return this.tasksService.assign(id, data, actorUserId);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('TASKS_UPDATE')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    this.requireManagementRole(request);

    return this.tasksService.update(id, data);
  }
}
