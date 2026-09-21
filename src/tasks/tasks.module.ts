import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [HttpModule, AuthModule, PermissionsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
