import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';

@Module({
  imports: [HttpModule],
  controllers: [SectorsController],
  providers: [SectorsService],
})
export class SectorsModule {}
