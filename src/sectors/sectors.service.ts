import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SectorsService {
  private readonly tasksServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl =
      this.configService.get<string>('TASKS_SERVICE_URL') ??
      'http://localhost:3002';
  }

  async create(data: unknown) {
    const response = await firstValueFrom(
      this.httpService.post(`${this.tasksServiceUrl}/sectors`, data),
    );

    return response.data;
  }
}
